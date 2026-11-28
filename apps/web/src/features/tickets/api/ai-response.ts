import type { TicketPriority } from "../../../types/ticket";

export const AI_UNAVAILABLE_MESSAGE = "AI unavailable — reply manually.";

export interface TicketAiSuggestion {
  category: "General" | "Technical" | "Account" | "Network" | "Billing";
  priority: TicketPriority;
}

function isTicketCategory(value: unknown): value is TicketAiSuggestion["category"] {
  return (
    value === "General" ||
    value === "Technical" ||
    value === "Account" ||
    value === "Network" ||
    value === "Billing"
  );
}

function isTicketPriority(value: unknown): value is TicketPriority {
  return value === "P1" || value === "P2" || value === "P3" || value === "P4";
}

export function formatAiErrorMessage(error: unknown): string {
  if (error instanceof Error && "status" in error) {
    const status = (error as { status?: unknown }).status;

    if (status === 401) {
      return "Your session has expired. Please sign in again.";
    }
    if (status === 403) {
      return "You do not have permission to use AI assistance.";
    }
    if (typeof status === "number" && status >= 500) {
      return AI_UNAVAILABLE_MESSAGE;
    }
  }

  if (
    error instanceof TypeError ||
    (error instanceof Error &&
      (error.message === "The AI service returned an empty reply." ||
        error.message === "AI reply stream was interrupted."))
  ) {
    return AI_UNAVAILABLE_MESSAGE;
  }

  return error instanceof Error ? error.message : AI_UNAVAILABLE_MESSAGE;
}

export function parseTicketAiSuggestion(value: unknown): TicketAiSuggestion {
  if (!value || typeof value !== "object") {
    throw new Error("The AI service returned an invalid suggestion.");
  }

  const suggestion = value as Record<string, unknown>;

  if (
    !isTicketCategory(suggestion.category) ||
    !isTicketPriority(suggestion.priority)
  ) {
    throw new Error("The AI service returned an invalid suggestion.");
  }

  return {
    category: suggestion.category,
    priority: suggestion.priority,
  };
}

export function parseCategoriseResponse(value: unknown): TicketAiSuggestion {
  if (!value || typeof value !== "object") {
    throw new Error("The AI service returned an invalid response.");
  }

  const response = value as {
    data?: unknown;
    meta?: { saved?: unknown };
  };

  if (response.meta?.saved !== false) {
    throw new Error(
      "The AI response did not confirm that the suggestion is unsaved."
    );
  }

  if (!response.data) {
    throw new Error("The AI service did not return a suggestion.");
  }

  return parseTicketAiSuggestion(response.data);
}

export async function* streamTextResponse(
  response: Response
): AsyncGenerator<string> {
  if (!response.body) {
    throw new Error("The AI service returned an empty reply.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let complete = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        complete = true;
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        fullText += chunk;
        yield chunk;
      }
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      fullText += finalChunk;
      yield finalChunk;
    }
  } catch {
    throw new Error("AI reply stream was interrupted.");
  } finally {
    if (!complete) {
      await reader.cancel().catch(() => undefined);
    }
    reader.releaseLock();
  }

  if (!fullText.trim()) {
    throw new Error("The AI service returned an empty reply.");
  }
}
