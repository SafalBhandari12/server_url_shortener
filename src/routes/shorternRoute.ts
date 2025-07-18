import { Router } from "express";
import { shorternRateLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";
import { UserController } from "../controllers/candidateController";

const router = Router();

// Url Shortener ro

router.post(
  "/",
  shorternRateLimiter,
  asyncHandler(UserController.shorten)
);

export default router;
