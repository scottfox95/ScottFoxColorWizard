import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { uploadSchema, insertColoringRequestSchema } from "@shared/schema";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import mime from "mime-types";
import OpenAI from "openai";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const openai = new OpenAI();

export async function registerRoutes(app: Express): Promise<Server> {

  // Endpoint to upload image and generate coloring page
  app.post("/api/generate-coloring-page", upload.single("image"), async (req, res) => {
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
      processImageGeneration(coloringRequest.id, req.file.buffer, req.file.originalname);

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

  // Background function to process image generation using OpenAI Responses API
  async function processImageGeneration(requestId: number, imageBuffer: Buffer, originalName: string) {
    try {
      /* Resize to 1024 px (docs recommend matching your output size) */
      const resized = await sharp(imageBuffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .png()                         // keep a clean, loss-free format
        .toBuffer();

      const mimeType = mime.lookup(originalName) || "image/png";
      const dataUrl = `data:${mimeType};base64,${resized.toString("base64")}`;

      /* One Responses-API call with the built-in image_generation tool */
      const resp = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Create a black and white line drawing for a kids' coloring book " +
                      "based on this photo. Keep the details simple and clean using clear " +
                      "outlines, but preserve the recognizable features of the people, " +
                      "setting, and background elements. Make it child-friendly and suitable " +
                      "for coloring, similar to a cartoon or coloring-book page."
              },
              {
                type: "image_url",
                image_url: { url: dataUrl }
              }
            ]
          }
        ],
        tools: [{ type: "image_generation" }],
      });

      /* Extract the base64 PNG produced by the tool call */
      const imageCall = resp.output.find(o => o.type === "image_generation_call");
      if (!imageCall) {
        throw new Error("Image generation failed - no result returned");
      }

      // Convert base64 result to data URL for storage
      const coloringPageUrl = `data:image/png;base64,${imageCall.result}`;

      // Update the request with the generated image
      await storage.updateColoringRequest(requestId, {
        coloringPageUrl: coloringPageUrl,
        status: "completed"
      });

    } catch (error) {
      console.error("Error generating coloring page:", error);
      await storage.updateColoringRequest(requestId, {
        status: "failed"
      });
    }
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
