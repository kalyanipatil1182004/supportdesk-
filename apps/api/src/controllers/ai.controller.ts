import type { Request, Response, NextFunction } from "express";
import { AiService } from "../ai/ai.service";
import { commentsService } from "../services/comments.service";
import { ticketsService } from "../services/tickets.service";

const aiService = new AiService();

function getTicketId(req: Request, res: Response): number | null {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      data: null,
      error: { message: "Invalid ticket ID" },
      meta: {},
    });
    return null;
  }

  return id;
}

export const aiController = {
  async suggestReply(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const id = getTicketId(req, res);
      if (id === null) return;

      const ticket = await ticketsService.findById(
        id,
        user.id,
        user.role
      );

      const comments = await commentsService.listForTicket(
        id,
        user.id,
        user.role
      );

      const recentComments = comments
        .slice(-5)
        .map((comment) => comment.body)
        .join("\n");

      const input = {
        title: ticket.title,
        description: [
          ticket.description,
          recentComments
            ? `Recent public comments:\n${recentComments}`
            : "",
        ].filter(Boolean).join("\n\n"),
      };

      res.status(200);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Content-Type-Options", "nosniff");

      for await (const chunk of aiService.streamSuggestedReply(input)) {
        if (res.destroyed) return;
        res.write(chunk);
      }

      if (!res.destroyed) res.end();
    } catch (error) {
      if (res.headersSent) {
        res.destroy(error instanceof Error ? error : undefined);
        return;
      }
      next(error);
    }
  },

  async categorise(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const id = getTicketId(req, res);
      if (id === null) return;

      const ticket = await ticketsService.findById(
        id,
        user.id,
        user.role
      );

      const suggestion = await aiService.categoriseTicket({
        title: ticket.title,
        description: ticket.description,
      });

      res.status(200).json({
        data: suggestion,
        error: null,
        meta: {
          saved: false,
          provider: "mock",
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
