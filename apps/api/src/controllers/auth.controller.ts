import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.schema";

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid registration data" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const result = await authService.register(parsed.data);

    if (!result.success) {
      res.status(409).json({
        data: null,
        error: { message: "An account with this email already exists" },
        meta: {},
      });
      return;
    }

    res.status(201).json({
      data: { user: result.user },
      error: null,
      meta: {},
    });
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid login data" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const result = await authService.login(parsed.data);

    if (!result.success) {
      res.status(401).json({
        data: null,
        error: { message: "Invalid email or password" },
        meta: {},
      });
      return;
    }

    res.status(200).json({
      data: { user: result.user, token: result.token },
      error: null,
      meta: {},
    });
  },
};
