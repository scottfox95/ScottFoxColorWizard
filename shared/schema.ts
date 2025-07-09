import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const coloringRequests = pgTable("coloring_requests", {
  id: serial("id").primaryKey(),
  originalImageUrl: text("original_image_url").notNull(),
  coloringPageUrl: text("coloring_page_url").notNull(),
  status: text("status").notNull().default("processing"), // processing, completed, failed
});

export const insertColoringRequestSchema = createInsertSchema(coloringRequests).omit({
  id: true,
});

export type InsertColoringRequest = z.infer<typeof insertColoringRequestSchema>;
export type ColoringRequest = typeof coloringRequests.$inferSelect;

// For the upload request
export const uploadSchema = z.object({
  imageData: z.string(), // base64 encoded image
});

export type UploadRequest = z.infer<typeof uploadSchema>;

// For the generation response
export const generationResponseSchema = z.object({
  id: z.number(),
  originalImageUrl: z.string(),
  coloringPageUrl: z.string(),
  status: z.string(),
});

export type GenerationResponse = z.infer<typeof generationResponseSchema>;
