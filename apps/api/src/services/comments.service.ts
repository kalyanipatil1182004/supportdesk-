import type { UserRole } from "@prisma/client";
import type { z } from "zod";
import { commentsRepository } from "../repositories/comments.repository";
import { ticketsService } from "./tickets.service";
import { createCommentSchema } from "../validators/comments.schema";

type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const commentsService = {
  async listForTicket(ticketId: number, userId: number, role: UserRole) {
    await ticketsService.findById(ticketId, userId, role);
    return commentsRepository.findPublicByTicketId(ticketId);
  },

  async createForTicket(
    ticketId: number,
    userId: number,
    role: UserRole,
    data: CreateCommentInput
  ) {
    await ticketsService.findById(ticketId, userId, role);
    return commentsRepository.create({
      ...data,
      ticketId,
      authorId: userId,
    });
  },
};
