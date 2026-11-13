import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(5).max(2000),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  category: z.string().trim().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().trim().min(3).max(150).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  status: z.enum([
    "open",
    "in_progress",
    "waiting_on_customer",
    "resolved",
    "closed",
  ]).optional(),
  category: z.string().trim().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});