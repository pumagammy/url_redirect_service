
import { UrlService } from "../services/url-service";
import { createSuccessResponse, createErrorResponse } from "../utils/response/response-formatters";
import { ERROR_MSG_SOMETHING_WENT_WRONG, GET_ITEMS_SUCCESS_MESSAGE } from "../utils/response/response-message";

export const getRedirectToOriginalUrl = async (req: any, res: any) => {
  try {
    const result = await UrlService.redirectToOriginal(req.params.shortCode); 
     return res.redirect(result);
  } catch (err: any) {
    return createErrorResponse(res, err.message || ERROR_MSG_SOMETHING_WENT_WRONG);
  }
};