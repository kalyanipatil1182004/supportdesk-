import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      data: null,
      error: { message: "Authentication required" },
      meta: {},
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      data: null,
      error: { message: "Invalid authentication token" },
      meta: {},
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      !/^[1-9]\d*$/.test(decoded.sub)
    ) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid authentication token" },
        meta: {},
      });
      return;
    }

    const userId = Number(decoded.sub);

    if (!Number.isSafeInteger(userId)) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid authentication token" },
        meta: {},
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid authentication token" },
        meta: {},
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid or expired authentication token" },
        meta: {},
      });
      return;
    }

    next(error);
  }
}