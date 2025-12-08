// src/controllers/redirect-original-url.ts
import { Request, Response } from "express";
import { UrlService } from "../services/url-service";
import { createErrorResponse } from "../utils/response/response-formatters";
import { ERROR_MSG_SOMETHING_WENT_WRONG } from "../utils/response/response-message";

export const getRedirectToOriginalUrl = async (req: Request, res: Response) => {
  try {
    const shortCode = req.params.shortCode;
    const originalUrl = await UrlService.redirectToOriginal(shortCode);
    // Ensure absolute URL (with protocol)
    const redirectUrl = /^https?:\/\//i.test(originalUrl)
      ? originalUrl
      : `https://${originalUrl}`;

    return res.redirect(302, redirectUrl);
  } catch (err: any) {
    console.error("Error in getRedirectToOriginalUrl:", err);
    return createErrorResponse(res, err.message || ERROR_MSG_SOMETHING_WENT_WRONG);
  }
};
