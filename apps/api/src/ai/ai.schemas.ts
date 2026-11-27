import { z } from "zod";

export const AI_MAX_TITLE_LENGTH = 150;
export const AI_MAX_DESCRIPTION_LENGTH = 2000;
export const AI_MAX_COMMENT_LENGTH = 1000;
export const AI_MAX_COMMENTS_COUNT = 5;
export const AI_MAX_REPLY_LENGTH = 2000;
export const AI_DEFAULT_TIMEOUT_MS = 15000;
export const AI_MAX_TIMEOUT_MS = 120000;
export const AI_UNAVAILABLE_MESSAGE = "AI unavailable — reply manually.";

export function resolveAiTimeoutMs(overrideMs?: number): number {
  const candidate =
    overrideMs ?? Number(process.env.AI_REQUEST_TIMEOUT_MS ?? NaN);

  if (
    Number.isFinite(candidate) &&
    candidate > 0 &&
    candidate <= AI_MAX_TIMEOUT_MS
  ) {
    return Math.floor(candidate);
  }

  return AI_DEFAULT_TIMEOUT_MS;
}

export class AiInputValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "AiInputValidationError";
  }
}

export class AiOutputValidationError extends Error {
  readonly statusCode = 502;

  constructor(message: string) {
    super(message);
    this.name = "AiOutputValidationError";
  }
}

export class AiTimeoutError extends Error {
  readonly statusCode = 504;

  constructor(message = AI_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "AiTimeoutError";
  }
}

export class AiUnavailableError extends Error {
  readonly statusCode = 503;

  constructor(message = AI_UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export const ticketAiInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Ticket title is required")
    .max(
      AI_MAX_TITLE_LENGTH,
      `Ticket title must be at most ${AI_MAX_TITLE_LENGTH} characters`
    ),
  description: z
    .string()
    .trim()
    .min(1, "Ticket description is required")
    .max(
      AI_MAX_DESCRIPTION_LENGTH,
      `Ticket description must be at most ${AI_MAX_DESCRIPTION_LENGTH} characters`
    ),
  comments: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Comment cannot be empty")
        .max(
          AI_MAX_COMMENT_LENGTH,
          `Each comment must be at most ${AI_MAX_COMMENT_LENGTH} characters`
        )
    )
    .max(
      AI_MAX_COMMENTS_COUNT,
      `At most ${AI_MAX_COMMENTS_COUNT} comments are allowed`
    )
    .optional(),
});

export type ValidatedTicketAiInput = z.infer<typeof ticketAiInputSchema>;

export const ticketAiSuggestionSchema = z
  .object({
    category: z.enum([
      "General",
      "Technical",
      "Account",
      "Network",
      "Billing",
    ]),
    priority: z.enum(["P1", "P2", "P3", "P4"]),
  })
  .strict();

export type ValidatedTicketAiSuggestion = z.infer<
  typeof ticketAiSuggestionSchema
>;

export const suggestedReplyOutputSchema = z
  .string("AI reply must be a string")
  .max(
    AI_MAX_REPLY_LENGTH,
    `AI reply must be at most ${AI_MAX_REPLY_LENGTH} characters`
  )
  .trim()
  .min(1, "AI reply cannot be empty");

/**
 * Strictly validates an AI categorisation payload and rejects missing/extra fields or bad types.
 */
export function validateCategorisationOutput(
  result: unknown
): ValidatedTicketAiSuggestion {
  const parsed = ticketAiSuggestionSchema.safeParse(result);

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "Invalid categorisation output";
    throw new AiOutputValidationError(
      `AI categorisation output validation failed: ${issue}`
    );
  }

  return parsed.data;
}

/**
 * Validates that a suggested reply is a non-empty string within the maximum length.
 */
export function validateSuggestedReplyOutput(reply: unknown): string {
  const parsed = suggestedReplyOutputSchema.safeParse(reply);

  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? "Invalid reply output";
    throw new AiOutputValidationError(
      `AI reply output validation failed: ${issue}`
    );
  }

  return parsed.data;
}
