import { Router } from "express";
import { shorternRateLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UserController } from "../controllers/candidateController.js";

const router = Router();

// Url Shortener ro

router.post(
  "/",
  shorternRateLimiter,
  asyncHandler(UserController.shorten)
);

export default router;
