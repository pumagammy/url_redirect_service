import mongoose, { Schema } from "mongoose";

export interface Iurl extends Document {
  originalUrl: String;
  guid: string;
  shortCode: String;
  customCode: string;
  shortUrl: String;
  isPremium: boolean;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date | null;
  isExpired?: boolean;
  isActive?: boolean;
}

const UrlSchema: Schema = new mongoose.Schema<Iurl>(
  {
    originalUrl: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    shortUrl: { type: String, required: true, unique: true },
    guid: { type: String, required: true, unique: true },
    customCode: { type: String },
    isPremium: { type: Boolean, default: false },
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

UrlSchema.index({ shortCode: 1 }, { unique: true });
UrlSchema.index({ guid: 1 }, { unique: true });

export const UrlModel = mongoose.model<Iurl>("Url", UrlSchema);