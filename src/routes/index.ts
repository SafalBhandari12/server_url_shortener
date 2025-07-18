import { Router } from "express";
import authRouter from "./authRoutes.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../types/index.js";
import shortenRoute from "./shorternRoute.js";
import userRouter from "./candidateRoute.js";

const router = Router();

// Health check - Must come before the catch-all route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/short", shortenRoute);

router.use("/auth", authRouter);

router.use("/user", userRouter);

router.get(
  "/protected",
  asyncHandler(isAuthenticated),
  (req: AuthRequest, res) => {
    res.status(200).json({
      success: true,
      message: "Protected route accessed",
      user: req.user,
    });
  }
);

export default router;
