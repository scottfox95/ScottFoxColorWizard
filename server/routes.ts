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
      processImageGeneration(coloringRequest.id, imageBase64, req.file.mimetype);

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
  async function processImageGeneration(requestId: number, imageBase64: string, mimetype: string) {
    try {
      // Use GPT-4o vision to analyze the image and create a detailed prompt for DALL-E
      const analysisPrompt = "Analyze this image and create a detailed prompt for generating a black and white line drawing coloring book page. Focus on the main subjects, their poses, setting, and key details that should be preserved but simplified for children to color. Describe it as a prompt for an AI image generator.";

      const visionResponse = await openai.chat.completions.create({
        model: process.env.IMAGE_MODEL || "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimetype};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const imageDescription = visionResponse.choices[0].message.content;
      
      // Create a DALL-E prompt for a coloring book page
      const dallePrompt = `Create a black and white line drawing for a children's coloring book based on this description: ${imageDescription}. Style: Simple line art, clean outlines, no shading, no filled areas, suitable for coloring with crayons or markers. The drawing should be child-friendly with clear, bold lines.`;

      // Use DALL-E to generate the coloring page
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: dallePrompt,
        size: "1024x1024",
        style: "natural",
        quality: "standard",
        response_format: "b64_json"
      });

      let generatedImageUrl = "";
      if (imageResponse.data[0].b64_json) {
        generatedImageUrl = `data:image/png;base64,${imageResponse.data[0].b64_json}`;
      }

      // Update the request with the generated image
      await storage.updateColoringRequest(requestId, {
        coloringPageUrl: generatedImageUrl,
        status: generatedImageUrl ? "completed" : "failed"
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
