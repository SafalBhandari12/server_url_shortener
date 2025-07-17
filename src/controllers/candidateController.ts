import { Response } from "express";
import prisma from "../utils/database.js";
import { AuthRequest } from "../types/index.js";
import z, { string } from "zod";
import { nanoid } from "nanoid";

const longUrlSchema = z.object({
  longUrl: string(),
});

const shortUrlSchema = z.object({
  shortUrl: string(),
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
    const { longUrl } = longUrlSchema.parse(req.body);

    const shortUrl = nanoid(6);

    const record = await prisma.shortern.create({
      data: {
        shortCode: shortUrl,
        longUrl: longUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "The short url created successfully",
      shortUrl: shortUrl,
    });
  }
  static async longer(req: AuthRequest, res: Response) {
    const { shortUrl } = shortUrlSchema.parse(req.params);

    const record = await prisma.shortern.findUnique({
      where: { shortCode: shortUrl },
    });

    if (record) {
      res.redirect(record.longUrl);
    } else {
      res.status(404).json({ success: false, message: "Url not found" });
    }
  }
}
