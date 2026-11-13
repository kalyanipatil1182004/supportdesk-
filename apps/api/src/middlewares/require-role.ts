import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@prisma/client";

export function requireRole(...allowedRoles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        data: null,
        error: { message: "Authentication required" },
        meta: {},
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        data: null,
        error: { message: "Access forbidden" },
        meta: {},
      });
      return;
    }

    next();
  };
}