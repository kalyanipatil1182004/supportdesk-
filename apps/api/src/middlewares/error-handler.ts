import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error("API Error:", error);
  }

  res.status(statusCode).json({
    data: null,
    error: {
      message:
        statusCode === 404
          ? "Ticket not found"
          : "Internal server error",
    },
    meta: {},
  });
}