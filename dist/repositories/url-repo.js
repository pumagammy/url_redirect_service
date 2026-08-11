"use strict";
// src/repositories/url-repo.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlRepo = void 0;
const url_schems_1 = require("../models/url-schems");
exports.UrlRepo = {
    async findByShortCode(shortCode) {
        return url_schems_1.UrlModel.findOne({ shortCode }).exec();
    },
    async incrementClicksByShortCode(shortCode) {
        await url_schems_1.UrlModel.updateOne({ shortCode }, { $inc: { clicks: 1 } }).exec();
    },
    async save(doc) {
        const urlDoc = new url_schems_1.UrlModel(doc);
        return urlDoc.save();
    },
};
