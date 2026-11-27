import type { Request, Response, NextFunction } from "express";
import {
  AI_MAX_COMMENT_LENGTH,
  AI_MAX_COMMENTS_COUNT,
  AiInputValidationError,
  AiOutputValidationError,
  AiTimeoutError,
  AiUnavailableError,
} from "../ai/ai.schemas";
import { AiModerationError } from "../ai/moderation";
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

function toSafeControllerError(error: unknown): unknown {
  if (
    error instanceof AiInputValidationError ||
    error instanceof AiModerationError ||
    error instanceof AiOutputValidationError ||
    error instanceof AiTimeoutError ||
    error instanceof AiUnavailableError
  ) {
    return error;
  }

  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number" &&
    (error as { statusCode: number }).statusCode < 500
  ) {
    return error;
  }

  return new AiUnavailableError();
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
        .slice(-AI_MAX_COMMENTS_COUNT)
        .map((comment) => comment.body.trim().slice(0, AI_MAX_COMMENT_LENGTH))
        .filter(Boolean);

      const input = {
        title: ticket.title,
        description: ticket.description,
        ...(recentComments.length > 0 ? { comments: recentComments } : {}),
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
      next(toSafeControllerError(error));
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

      const { suggestion, provider } = await aiService.categoriseTicketWithMeta(
        {
          title: ticket.title,
          description: ticket.description,
        }
      );

      res.status(200).json({
        data: suggestion,
        error: null,
        meta: {
          saved: false,
          provider,
        },
      });
    } catch (error) {
      next(toSafeControllerError(error));
    }
  },
};
