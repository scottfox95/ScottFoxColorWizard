import type { Express } from "express";
import { createServer, type Server } from "http";
import multer       from "multer";
import sharp        from "sharp";
import mime         from "mime-types";
import OpenAI       from "openai";

const upload  = multer({ storage: multer.memoryStorage() });
const openai  = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

export async function registerRoutes(app: Express): Promise<Server> {
  /**
   * POST /api/generate-coloring-page
   * Body form-data: { image: <binary file> }
   * Returns: { base64: "..." }  (PNG in base64—frontend decides how to display)
   */
  app.post("/api/generate-coloring-page", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No image uploaded" });

      /* 2-A  Resize to 1024 px (docs recommend matching your output size) */
      const resized = await sharp(req.file.buffer)
        .resize({ width: 1024, withoutEnlargement: true })
        .png()                         // keep a clean, loss-free format
        .toBuffer();

      const mimeType = mime.lookup(req.file.originalname) || "image/png";
      const dataUrl  = `data:${mimeType};base64,${resized.toString("base64")}`;

      /* 2-B  One Responses-API call with the built-in image_generation tool */
      const resp = await openai.responses.create({
        model: process.env.IMAGE_MODEL || "gpt-4o",
        tool_choice: { type: "image_generation" },   // force the call
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Create a black and white line drawing for a kids' coloring book " +
                  "based on this photo. Keep the details simple and clean using clear " +
                  "outlines, but preserve the recognizable features of the people, " +
                  "setting, and background elements. Make it child-friendly and suitable " +
                  "for coloring, similar to a cartoon or coloring-book page."
              },
              {
                type: "input_image",
                image_url: dataUrl
              }
            ]
          }
        ],
        tools: [{
          type: "image_generation",
          parameters: {
            style:   "line-art",
            size:    "1024x1024",
            quality: "standard"
          }
        }],
        temperature: 0.2
      });

      /* 2-C  Extract the base64 PNG produced by the tool call */
      const imageCall = resp.output.find(o => o.type === "image_generation_call");
      if (!imageCall) return res.status(500).json({ error: "Generation failed." });

      res.json({ base64: imageCall.result });        // send raw base64 back
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
