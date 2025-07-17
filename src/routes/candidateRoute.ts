import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { UserController } from "../controllers/candidateController.js";

const router = Router();

/**
 * @swagger
 * /candidate/:
 *   get:
 *     summary: Get current authenticated user info
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Candidate
 *     responses:
 *       200:
 *         description: User info retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  asyncHandler(isAuthenticated),
  asyncHandler(UserController.me).bind(UserController)
);

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

router.post(
  "/short/customize",
  asyncHandler(isAuthenticated),
  asyncHandler(UserController.customize)
);

/**
 * @swagger
 * /candidate/register:
 *   post:
 *     summary: Register a new candidate (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Candidate
 *     responses:
 *       201:
 *         description: Candidate registered
 *       401:
 *         description: Unauthorized
 */
router.post("/register", asyncHandler(isAuthenticated));

export default router;
