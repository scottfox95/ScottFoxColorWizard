import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadSchema, insertColoringRequestSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";
import mime from "mime-types";
import sharp from "sharp";

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
      // Resize to 1024px (optimal for GPT-4o) to keep tokens and cost down
      const buffer = Buffer.from(imageBase64, 'base64');
      const resizedBuffer = await sharp(buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .toBuffer();

      const mimeType = mime.lookup('image') || mimetype || "image/jpeg";
      const base64 = resizedBuffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64}`;

      // One single Chat Completions call with image_generation tool
      const response = await openai.chat.completions.create({
        model: process.env.IMAGE_MODEL || "gpt-4o",
        temperature: 0.2, // stay faithful to photo
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Create a black and white line drawing for a kids' coloring book " +
                      "based on this photo. Keep the details simple and clean using clear " +
                      "outlines, but preserve the recognizable features of the people, setting, " +
                      "and background elements. Make it child-friendly and suitable for coloring, " +
                      "similar to a cartoon or coloring book page."
              },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ],
        tools: [
          {
            type: "image_generation",
            parameters: {
              style: "line-art",
              size: "1024x1024",
              quality: "standard"
            }
          }
        ],
        tool_choice: "auto"
      });

      // The generated image URL is returned inside the tool call
      const toolCall = response.choices[0].message.tool_calls?.[0];
      const imageUrl = toolCall?.image_generation?.url;

      if (!imageUrl) {
        throw new Error("Image generation failed - no URL returned");
      }

      // Update the request with the generated image
      await storage.updateColoringRequest(requestId, {
        coloringPageUrl: imageUrl,
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
