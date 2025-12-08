// src/repositories/url-repo.ts

import { Iurl, UrlModel } from "../models/url-schems";


export const UrlRepo = {
  async findByShortCode(shortCode: string): Promise<Iurl | null> {
    return UrlModel.findOne({ shortCode }).exec();
  },

  async incrementClicksByShortCode(shortCode: string): Promise<void> {
    await UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }).exec();
  },

  async save(doc: Iurl): Promise<Iurl> {
    const urlDoc = new UrlModel(doc);
    return urlDoc.save();
  },
};
