import type { TicketAiInput } from "./mock-ai.provider";

export type ModerationCategory =
  | "violence"
  | "self_harm"
  | "harassment"
  | "malware_abuse";

export interface ModerationResult {
  allowed: boolean;
  category?: ModerationCategory;
  reason?: string;
}

export class AiModerationError extends Error {
  readonly statusCode = 422;
  readonly category?: ModerationCategory;

  constructor(
    message = "Ticket content was blocked by AI safety moderation.",
    category?: ModerationCategory
  ) {
    super(message);
    this.name = "AiModerationError";
    this.category = category;
  }
}

const MODERATION_RULES: ReadonlyArray<{
  category: ModerationCategory;
  reason: string;
  pattern: RegExp;
}> = [
  {
    category: "violence",
    reason: "explicit threat of violence or dangerous weapon instructions",
    pattern:
      /\b(?:i\s+(?:will|am\s+going\s+to|gonna)\s+(?:kill|murder|shoot|stab|bomb|attack|hurt)\s+(?:you|him|her|them|everyone|staff|the\s+team)|how\s+to\s+(?:make|build)\s+(?:a\s+)?(?:bomb|explosive|weapon))\b/i,
  },
  {
    category: "self_harm",
    reason: "self-harm encouragement or intent",
    pattern:
      /\b(?:kill\s+yourself|commit\s+suicide|i\s+(?:will|want\s+to)\s+kill\s+myself)\b/i,
  },
  {
    category: "harassment",
    reason: "severe abusive harassment",
    pattern:
      /\b(?:fuck\s+you|go\s+fuck\s+yourself|shut\s+the\s+fuck\s+up|you\s+(?:are|r)\s+(?:a\s+)?(?:worthless|pathetic)\s+(?:idiot|moron|trash)|piece\s+of\s+shit)\b/i,
  },
  {
    category: "malware_abuse",
    reason: "request to generate malware or cyberattack payloads",
    pattern:
      /\b(?:write|create|generate|build|give\s+me)\s+(?:a\s+)?(?:ransomware|keylogger|phishing\s+(?:email|kit|page|template)|malware|ddos\s+(?:script|attack)|sql\s+injection\s+(?:payload|exploit)|credential\s+stealer)\b/i,
  },
];

/**
 * Evaluates ticket fields and comments for clearly unsafe or abusive content
 * while allowing legitimate support requests that mention sensitive topics.
 */
export function moderateAiInput(input: TicketAiInput): ModerationResult {
  const fields = [input.title, input.description, ...(input.comments ?? [])];

  for (const field of fields) {
    for (const rule of MODERATION_RULES) {
      if (rule.pattern.test(field)) {
        return {
          allowed: false,
          category: rule.category,
          reason: rule.reason,
        };
      }
    }
  }

  return { allowed: true };
}

/**
 * Enforces moderation rules and throws a safe structured error if blocked.
 */
export function enforceAiModeration(input: TicketAiInput): void {
  const result = moderateAiInput(input);

  if (!result.allowed) {
    throw new AiModerationError(
      "Ticket content was blocked by AI safety moderation.",
      result.category
    );
  }
}
