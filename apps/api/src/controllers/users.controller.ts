import { z } from "zod";
import type { Request, Response } from "express";
import { usersRepository } from "../repositories/users.repository";

const directoryQuerySchema = z.object({
  page: z.coerce.number().int().safe().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const usersController = {
  async listCustomers(req: Request, res: Response) {
    const parsed = directoryQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid customer list query" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const { page, limit } = parsed.data;
    const result = await usersRepository.findCustomers(page, limit);

    res.status(200).json({
      data: result.customers,
      error: null,
      meta: {
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  },

  async listAdmins(req: Request, res: Response) {
    const parsed = directoryQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid admin list query" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const { page, limit } = parsed.data;
    const result = await usersRepository.findAdmins(page, limit);

    res.status(200).json({
      data: result.admins,
      error: null,
      meta: {
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      },
    });
  },
};
