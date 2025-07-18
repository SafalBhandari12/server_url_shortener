import { Response } from "express";
import prisma from "../utils/database.js";
import { AuthRequest, AuthRequestUser } from "../types/index.js";
import z, { date, string } from "zod";
import { customAlphabet } from "nanoid";
import client from "../utils/redisClient.js";
import { userDetails } from "../middleware/authMiddleware.js";

const longUrlSchema = z.object({
  longUrl: string(),
});

const shortUrlSchema = z.object({
  shortUrl: string(),
});

const urlschema = z.object({
  shortUrl: z.string().optional(),
  longUrl: z.string(),
  expiryTime: z
    .string()
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: "Invalid Date" })
    .refine((date) => date > new Date(), {
      message: "Cannot be in the past",
    }),
});

export class UserController {
  static async me(req: AuthRequest, res: Response) {
    try {
      console.log(req.user);
      const user = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: {
          id: true,
          email: true,
          name: true,
          emailVerified: true,
          role: true,
        },
      });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
      return;
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }

  static async shorten(req: AuthRequest, res: Response) {
    let { longUrl, shortUrl, expiryTime } = urlschema.parse(req.body);

    if (!shortUrl) {
      const alphabet =
        "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

      const nanoid = customAlphabet(alphabet, 7);
      shortUrl = nanoid();
    }

    const doesShortUrlExist = await prisma.shortern.findUnique({
      where: {
        shortCode: shortUrl,
      },
    });

    if (doesShortUrlExist) {
      res.status(409).json({
        success: false,
        message: "Short url already exists use another short url name",
      });
      return;
    }

    const now = new Date();

    const user = await userDetails(req!);
    console.log(user);

    if (user) {
      const thirtyDaysLater = new Date(
        now.getTime() + 1000 * 60 * 60 * 24 * 30
      );
      if (expiryTime > thirtyDaysLater) {
        res.status(400).json({
          success: false,
          message: "Expiry time cannot be more than 30 days",
        });
      }
      console.log(user);
      await prisma.shortern.create({
        data: {
          shortCode: shortUrl,
          longUrl: longUrl,
          expiresAt: expiryTime,
          userId: user.userId,
        },
      });
    } else {
      const oneDayLater = new Date(now.getTime() + 1000 * 60 * 60 * 24);
      if (expiryTime > oneDayLater) {
        res.status(400).json({
          success: false,
          message: "Expiry time cannot be more than 1 day for the free user. ",
        });
      }
      await prisma.shortern.create({
        data: {
          shortCode: shortUrl,
          longUrl: longUrl,
          expiresAt: expiryTime,
        },
      });
    }

    console.log(shortUrl, longUrl, expiryTime);

    await client.set(shortUrl, longUrl);

    return res.status(200).json({
      success: true,
      message: "The short url created successfully",
      shortUrl: shortUrl,
    });
  }

  static async longer(req: AuthRequest, res: Response) {
    const { shortUrl } = shortUrlSchema.parse(req.params);

    const longUrl = await client.get(shortUrl);
    if (longUrl) {
      res.redirect(longUrl);
    } else {
      const record = await prisma.shortern.findUnique({
        where: { shortCode: shortUrl },
      });
      if (record) {
        res.redirect(record.longUrl);
      }
    }
  }
}
