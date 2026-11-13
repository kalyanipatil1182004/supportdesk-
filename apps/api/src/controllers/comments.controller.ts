import type { Request, Response } from "express";
import { commentsService } from "../services/comments.service";
import { createCommentSchema } from "../validators/comments.schema";

function parseTicketId(value: string | string[]): number | null {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export const commentsController = {
  async list(req: Request, res: Response) {
    const ticketId = parseTicketId(req.params.ticketId);

    if (ticketId === null) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket ID" },
        meta: {},
      });
      return;
    }

    const user = req.user!;
    const comments = await commentsService.listForTicket(
      ticketId,
      user.id,
      user.role
    );

    res.status(200).json({
      data: comments,
      error: null,
      meta: {},
    });
  },

  async create(req: Request, res: Response) {
    const ticketId = parseTicketId(req.params.ticketId);

    if (ticketId === null) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid ticket ID" },
        meta: {},
      });
      return;
    }

    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        data: null,
        error: { message: "Invalid comment data" },
        meta: { issues: parsed.error.issues },
      });
      return;
    }

    const user = req.user!;
    const comment = await commentsService.createForTicket(
      ticketId,
      user.id,
      user.role,
      parsed.data
    );

    res.status(201).json({
      data: comment,
      error: null,
      meta: {},
    });
  },
};
