import { z } from "zod";

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().safe().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum([
    "open",
    "in_progress",
    "waiting_on_customer",
    "resolved",
    "closed",
  ]).optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  assigneeId: z.coerce.number().int().safe().positive().optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sortBy: z.enum([
    "id",
    "title",
    "status",
    "priority",
    "createdAt",
    "updatedAt",
  ]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).superRefine(({ page, limit }, ctx) => {
  if (!Number.isSafeInteger((page - 1) * limit)) {
    ctx.addIssue({
      code: "custom",
      path: ["page"],
      message: "Page and limit produce an invalid pagination offset",
    });
  }
});

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