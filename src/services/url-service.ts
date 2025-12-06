
import { UrlRepo } from "../repositories/url-repo";
import { ALREADY_IN_USE, BAD_REQUEST, INVALID_DATA, INTERNAL_SERVER_ERROR_MESSAGE, DATA_EXPIRED } from "../utils/response/response-message";


export const UrlService = {
 
 async redirectToOriginal(shortCode: string) {
    const urlEntry = await UrlRepo.findByShortCode(shortCode);
    if (!urlEntry) {
      throw new Error(BAD_REQUEST);
    }

    // Check if expired
    if (urlEntry.expiresAt && urlEntry.expiresAt < new Date()) {
      throw new Error(DATA_EXPIRED);
    }

    // Increment click count
    urlEntry.clicks += 1;
    await urlEntry.save();

    return  urlEntry.originalUrl;

  }


};
