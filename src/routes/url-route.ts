import express from "express";
import { getRedirectToOriginalUrl } from "../controllers/redirect-original-url";

const router = express.Router();

router.get("/:shortCode", getRedirectToOriginalUrl);

export default router;
