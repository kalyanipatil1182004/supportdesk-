import { apiRequest } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";
import type {
  Ticket,
  TicketListParams,
  TicketPagination,
} from "../../../types/ticket";

export type TicketListResponse = Omit<ApiEnvelope<Ticket[]>, "meta"> & {
  meta: {
    pagination: TicketPagination;
  };
};

export async function getTickets(
  token: string,
  filters: TicketListParams = {}
): Promise<TicketListResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();

  return apiRequest<TicketListResponse>(
    `/tickets${query ? `?${query}` : ""}`,
    { token }
  );
}

export async function getTicketById(
  token: string,
  ticketId: number
): Promise<ApiEnvelope<Ticket>> {
  return apiRequest<ApiEnvelope<Ticket>>(`/tickets/${ticketId}`, {
    token,
  });
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: "P1" | "P2" | "P3" | "P4";
  category?: string;
}

export async function createTicket(
  token: string,
  data: CreateTicketInput
): Promise<ApiEnvelope<Ticket>> {
  return apiRequest<ApiEnvelope<Ticket>>("/tickets", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}
import type { TicketComment } from "../../../types/comment";

export async function getTicketComments(
  token: string,
  ticketId: number
): Promise<ApiEnvelope<TicketComment[]>> {
  return apiRequest<ApiEnvelope<TicketComment[]>>(
    `/tickets/${ticketId}/comments`,
    { token }
  );
}

export async function addTicketComment(
  token: string,
  ticketId: number,
  body: string
): Promise<ApiEnvelope<TicketComment>> {
  return apiRequest<ApiEnvelope<TicketComment>>(
    `/tickets/${ticketId}/comments`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ body }),
    }
  );
}

export async function updateTicket(
  token: string,
  ticketId: number,
  data: { status?: Ticket["status"] }
): Promise<ApiEnvelope<Ticket>> {
  return apiRequest<ApiEnvelope<Ticket>>(
    `/tickets/${ticketId}`,
    {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }
  );
}
