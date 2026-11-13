import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

export const ticketsRepository = {
  findAll(creatorId?: number) {
    return prisma.ticket.findMany({
      where: creatorId === undefined ? {} : { creatorId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: number, creatorId?: number) {
    return prisma.ticket.findFirst({
      where: {
        id,
        ...(creatorId === undefined ? {} : { creatorId }),
      },
    });
  },

  create(data: Prisma.TicketUncheckedCreateInput) {
    return prisma.ticket.create({ data });
  },

  async update(
    id: number,
    data: Prisma.TicketUpdateManyMutationInput,
    creatorId?: number
  ) {
    const result = await prisma.ticket.updateMany({
      where: {
        id,
        ...(creatorId === undefined ? {} : { creatorId }),
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return prisma.ticket.findUnique({
      where: { id },
    });
  },
};