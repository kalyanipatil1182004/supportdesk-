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

  let message = "Internal server error";

  if (statusCode === 400) {
    message = error.message || "Invalid request";
  } else if (statusCode === 401) {
    message = error.message || "Authentication required";
  } else if (statusCode === 403) {
    message = error.message || "Access forbidden";
  } else if (statusCode === 404) {
    message = "Ticket not found";
  }

  res.status(statusCode).json({
    data: null,
    error: {
      message,
    },
    meta: {},
  });
}