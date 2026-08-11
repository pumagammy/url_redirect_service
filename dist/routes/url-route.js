"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redirect_original_url_1 = require("../controllers/redirect-original-url");
const router = express_1.default.Router();
router.get("/:shortCode", redirect_original_url_1.getRedirectToOriginalUrl);
exports.default = router;
