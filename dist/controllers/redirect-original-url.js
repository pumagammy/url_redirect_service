"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedirectToOriginalUrl = void 0;
const url_service_1 = require("../services/url-service");
const response_formatters_1 = require("../utils/response/response-formatters");
const response_message_1 = require("../utils/response/response-message");
const getRedirectToOriginalUrl = async (req, res) => {
    try {
        const shortCode = req.params.shortCode;
        const originalUrl = await url_service_1.UrlService.redirectToOriginal(shortCode);
        // Ensure absolute URL (with protocol)
        const redirectUrl = /^https?:\/\//i.test(originalUrl)
            ? originalUrl
            : `https://${originalUrl}`;
        return res.redirect(302, redirectUrl);
    }
    catch (err) {
        console.error("Error in getRedirectToOriginalUrl:", err);
        return (0, response_formatters_1.createErrorResponse)(res, err.message || response_message_1.ERROR_MSG_SOMETHING_WENT_WRONG);
    }
};
exports.getRedirectToOriginalUrl = getRedirectToOriginalUrl;
