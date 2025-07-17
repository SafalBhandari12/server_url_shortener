import { Router } from "express";
import authRouter from "./authRoutes.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../types/index.js";
import userRouter from "./candidateRoute.js";
import { UserController } from "../controllers/candidateController.js";

const router = Router();

// Health check - Must come before the catch-all route
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Url shortener routes
/**
 * @swagger
 * /candidate/short:
 *   post:
 *     summary: Shorten a URL
 *     tags:
 *       - Candidate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com"
 *     responses:
 *       200:
 *         description: Short URL created
 *       400:
 *         description: Invalid input
 */
router.post("/short", asyncHandler(UserController.shorten));

/**
 * @swagger
 * /candidate/{shortUrl}:
 *   get:
 *     summary: Get the original URL from a short URL
 *     tags:
 *       - Candidate
 *     parameters:
 *       - in: path
 *         name: shortUrl
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Original URL retrieved
 *       404:
 *         description: Short URL not found
 */
router.get("/:shortUrl", asyncHandler(UserController.longer));


router.post("/short/customize", asyncHandler(UserController.customize));


//

// Mount auth routes under /auth
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
