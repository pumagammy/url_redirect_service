import express from "express";
import { getRedirectToOriginalUrl } from "../controllers/redirect-original-url";



const router = express.Router();


// always redirect route should be at the end to avoid conflicts with other routes
router.get("/:shortCode", async (req, res) => {
  const redirectToOriginalUrl = await getRedirectToOriginalUrl(req, res);
  return redirectToOriginalUrl;
});

export default router;
