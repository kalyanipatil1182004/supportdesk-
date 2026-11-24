import { z } from "zod";

export const ticketAiSuggestionSchema = z.object({
  category: z.enum([
    "General",
    "Technical",
    "Account",
    "Network",
    "Billing",
  ]),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
});

export type ValidatedTicketAiSuggestion = z.infer<
  typeof ticketAiSuggestionSchema
>;
