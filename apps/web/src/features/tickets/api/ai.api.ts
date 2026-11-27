import { apiRequestResponse } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";
import { parseAiProvider, parseCategoriseResponse } from "./ai-response";
import type { AiProviderName, TicketAiSuggestion } from "./ai-response";

interface CategoriseResponse extends ApiEnvelope<unknown> {
  meta: {
    saved?: boolean;
    provider?: string;
  };
}

export async function suggestTicketReply(
  token: string,
  ticketId: number
): Promise<{ response: Response; provider: AiProviderName | null }> {
  const response = await apiRequestResponse(
    `/ai/tickets/${ticketId}/suggest-reply`,
    {
      method: "POST",
      token,
    }
  );

  if (!response.headers.get("content-type")?.includes("text/plain")) {
    throw new Error("The AI service returned an unexpected reply format.");
  }

  return {
    response,
    provider: parseAiProvider(response.headers.get("x-ai-provider")),
  };
}

export async function categoriseTicket(
  token: string,
  ticketId: number
): Promise<{
  suggestion: TicketAiSuggestion;
  provider: AiProviderName | null;
  saved: false;
}> {
  const response = await apiRequestResponse(
    `/ai/tickets/${ticketId}/categorise`,
    {
      method: "POST",
      token,
    }
  );
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "The AI service returned an unexpected categorisation format."
    );
  }
  const result = (await response.json()) as CategoriseResponse;

  return { ...parseCategoriseResponse(result), saved: false };
}
