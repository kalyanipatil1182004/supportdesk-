import { ticketsRepository } from "../repositories/tickets.repository";
import type { z } from "zod";
import type { UserRole } from "@prisma/client";
import {
  createTicketSchema,
  updateTicketSchema,
} from "../validators/tickets.schema";

type CreateTicketInput = z.infer<typeof createTicketSchema>;
type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export const ticketsService = {
  findAll(userId: number, role: UserRole) {
    const creatorId = role === "customer" ? userId : undefined;
    return ticketsRepository.findAll(creatorId);
  },

  async findById(id: number, userId: number, role: UserRole) {
    const creatorId = role === "customer" ? userId : undefined;

    const ticket = await ticketsRepository.findById(id, creatorId);

    if (!ticket) {
      throw Object.assign(new Error("Ticket not found"), {
        statusCode: 404,
      });
    }

    return ticket;
  },

  create(data: CreateTicketInput, userId: number) {
    return ticketsRepository.create({
      ...data,
      creatorId: userId,
    });
  },

  async update(
    id: number,
    data: UpdateTicketInput,
    userId: number,
    role: UserRole
  ) {
    const creatorId = role === "customer" ? userId : undefined;

    const ticket = await ticketsRepository.update(
      id,
      data,
      creatorId
    );

    if (!ticket) {
      throw Object.assign(new Error("Ticket not found"), {
        statusCode: 404,
      });
    }

    return ticket;
  },
};