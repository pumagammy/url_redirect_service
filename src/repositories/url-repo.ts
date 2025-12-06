import { UrlModel } from "../models/url-schems";
import { generateShortCode } from "../utils/short-code-utils/generate-shortcode";


export const UrlRepo = {
  async findByShortCode(shortCode: string) {
    return UrlModel.findOne({ shortCode });
  },

};
