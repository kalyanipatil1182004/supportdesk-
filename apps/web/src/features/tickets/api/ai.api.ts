import { apiRequestResponse } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";
import { parseCategoriseResponse } from "./ai-response";
import type { TicketAiSuggestion } from "./ai-response";

interface CategoriseResponse extends ApiEnvelope<unknown> {
  meta: {
    saved?: boolean;
    provider?: string;
  };
}

export async function suggestTicketReply(
  token: string,
  ticketId: number
): Promise<Response> {
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

  return response;
}

export async function categoriseTicket(
  token: string,
  ticketId: number
): Promise<{ suggestion: TicketAiSuggestion; saved: false }> {
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

  return {
    suggestion: parseCategoriseResponse(result),
    saved: false,
  };
}
