import { coloringRequests, type ColoringRequest, type InsertColoringRequest } from "@shared/schema";

export interface IStorage {
  createColoringRequest(request: InsertColoringRequest): Promise<ColoringRequest>;
  getColoringRequest(id: number): Promise<ColoringRequest | undefined>;
  updateColoringRequest(id: number, updates: Partial<ColoringRequest>): Promise<ColoringRequest | undefined>;
}

export class MemStorage implements IStorage {
  private requests: Map<number, ColoringRequest>;
  private currentId: number;

  constructor() {
    this.requests = new Map();
    this.currentId = 1;
  }

  async createColoringRequest(insertRequest: InsertColoringRequest): Promise<ColoringRequest> {
    const id = this.currentId++;
    const request: ColoringRequest = { 
      ...insertRequest, 
      id,
      status: "processing"
    };
    this.requests.set(id, request);
    return request;
  }

  async getColoringRequest(id: number): Promise<ColoringRequest | undefined> {
    return this.requests.get(id);
  }

  async updateColoringRequest(id: number, updates: Partial<ColoringRequest>): Promise<ColoringRequest | undefined> {
    const existing = this.requests.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.requests.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
