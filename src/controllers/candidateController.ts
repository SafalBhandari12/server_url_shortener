import { Response } from "express";
import prisma from "../utils/database.js";
import { AuthRequest, AuthRequestUser } from "../types/index.js";
import z, { date, string } from "zod";
import { customAlphabet } from "nanoid";
import client from "../utils/redisClient.js";

const longUrlSchema = z.object({
  longUrl: string(),
});

const shortUrlSchema = z.object({
  shortUrl: string(),
});

const urlschema = z.object({
  shortUrl: string().optional(),
  longUrl: string(),
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
    let { longUrl, shortUrl } = urlschema.parse(req.body);

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

    const record = await prisma.shortern.create({
      data: {
        shortCode: shortUrl,
        longUrl: longUrl,
      },
    });

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
