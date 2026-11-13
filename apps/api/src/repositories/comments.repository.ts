import { prisma } from "../config/prisma";

const commentSelect = {
  id: true,
  body: true,
  isInternal: true,
  ticketId: true,
  authorId: true,
  createdAt: true,
} as const;

export const commentsRepository = {
  create(data: { body: string; ticketId: number; authorId: number }) {
    return prisma.comment.create({
      data,
      select: commentSelect,
    });
  },

  findPublicByTicketId(ticketId: number) {
    return prisma.comment.findMany({
      where: {
        ticketId,
        isInternal: false,
      },
      orderBy: { createdAt: "asc" },
      select: commentSelect,
    });
  },
};
