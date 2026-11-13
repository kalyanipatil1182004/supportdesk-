import { prisma } from "../config/prisma";
import type { Prisma, TicketPriority, TicketStatus } from "@prisma/client";

type TicketListOptions = {
  page: number;
  limit: number;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: number;
  search?: string;
  sortBy: "id" | "title" | "status" | "priority" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
};

export const ticketsRepository = {
  async findAll(creatorId: number | undefined, options: TicketListOptions) {
    const where: Prisma.TicketWhereInput = {
      ...(creatorId === undefined ? {} : { creatorId }),
      ...(options.status === undefined ? {} : { status: options.status }),
      ...(options.priority === undefined ? {} : { priority: options.priority }),
      ...(options.assigneeId === undefined
        ? {}
        : { assigneeId: options.assigneeId }),
    };

    if (options.search !== undefined) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { description: { contains: options.search, mode: "insensitive" } },
        { category: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.TicketOrderByWithRelationInput[] = [
      { [options.sortBy]: options.sortOrder },
    ];

    if (options.sortBy !== "id") {
      orderBy.push({ id: "asc" });
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy,
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total };
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