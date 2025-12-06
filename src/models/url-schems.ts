import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface Iurl extends Document {
  requestId: String;
  originalUrl: String;
  shortCode: String;
  customizedCode: string;
  shortUrl: String;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date | null;
  isExpired?: boolean;
  isActive?: boolean;
}

const UrlSchema: Schema = new mongoose.Schema<Iurl>(
  {
    requestId: { type: String, required: true, unique: true, default: uuidv4 },
    originalUrl: { type: String, required: true ,trim:true,},
    shortCode: { type: String, required: true, unique: true,index:true },
    shortUrl: { type: String, required: true, unique: true },
    customizedCode: { type: String },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    isExpired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// TTL index to automatically delete expired documents
UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UrlModel = mongoose.model<Iurl>("Url", UrlSchema);
