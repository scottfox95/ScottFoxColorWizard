import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadSchema, insertColoringRequestSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";

// Extend Request type to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Endpoint to upload image and generate coloring page
  app.post("/api/generate-coloring-page", upload.single("image"), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      // Convert uploaded file to base64
      const imageBase64 = req.file.buffer.toString('base64');
      const imageDataUrl = `data:${req.file.mimetype};base64,${imageBase64}`;

      // Create initial request record
      const coloringRequest = await storage.createColoringRequest({
        originalImageUrl: imageDataUrl,
        coloringPageUrl: "",
        status: "processing"
      });

      // Start background processing
      processImageGeneration(coloringRequest.id, imageBase64);

      res.json({ 
        id: coloringRequest.id,
        status: "processing",
        message: "Image upload successful, generating coloring page..." 
      });

    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ message: "Failed to process image upload" });
    }
  });

  // Endpoint to check generation status
  app.get("/api/coloring-request/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await storage.getColoringRequest(id);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error("Error fetching request:", error);
      res.status(500).json({ message: "Failed to fetch request status" });
    }
  });

  // Background function to process image generation
  async function processImageGeneration(requestId: number, imageBase64: string) {
    try {
      // Use the Responses API with image generation tool - this mimics how ChatGPT works
      // It can process both the uploaded image AND your text prompt together
      const userPrompt = "Create a black and white line drawing for a kids' coloring book based on this photo. Keep the details simple and clean using clear outlines, but preserve the recognizable features of the people, setting, and background elements. Make it child-friendly and suitable for coloring, similar to a cartoon or coloring book page.";

      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            type: "text",
            text: userPrompt
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ],
        tools: [{ type: "image_generation" }],
      });

      // Extract the generated image from the Responses API output
      const imageData = response.output
        .filter((output) => output.type === "image_generation_call")
        .map((output) => output.result);

      let generatedImageUrl = "";
      if (imageData.length > 0) {
        // Convert base64 to data URL for storage
        const imageBase64 = imageData[0];
        generatedImageUrl = `data:image/png;base64,${imageBase64}`;
      }

      // Update the request with the generated image
      await storage.updateColoringRequest(requestId, {
        coloringPageUrl: generatedImageUrl,
        status: "completed"
      });

    } catch (error) {
      console.error("Error generating coloring page:", error);
      await storage.updateColoringRequest(requestId, {
        status: "failed"
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
