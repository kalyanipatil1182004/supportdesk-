import type { Request, Response } from "express";
import { ticketsService } from "../services/tickets.service";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../validators/tickets.schema";

export const ticketsController = {
  async getAll(req: Request, res: Response) {
    const user = req.user!;

    const tickets = await ticketsService.findAll(
      user.id,
      user.role
    );

    res.status(200).json({
      data: tickets,
      error: null,
      meta: {},
    });
  },

  async getById(req: Request, res: Response) {
    const user = req.user!;
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket ID" },
        meta: {},
      });
      return;
    }

    const ticket = await ticketsService.findById(
      id,
      user.id,
      user.role
    );

    res.status(200).json({
      data: ticket,
      error: null,
      meta: {},
    });
  },

  async create(req: Request, res: Response) {
    const user = req.user!;
    const parsed = createTicketSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket data" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const ticket = await ticketsService.create(
      parsed.data,
      user.id
    );

    res.status(201).json({
      data: ticket,
      error: null,
      meta: {},
    });
  },

  async update(req: Request, res: Response) {
    const user = req.user!;
    const id = Number(req.params.id);
    const parsed = updateTicketSchema.safeParse(req.body);

    if (!Number.isSafeInteger(id) || id <= 0) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket ID" },
        meta: {},
      });
      return;
    }

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket data" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const ticket = await ticketsService.update(
      id,
      parsed.data,
      user.id,
      user.role
    );

    res.status(200).json({
      data: ticket,
      error: null,
      meta: {},
    });
  },
};