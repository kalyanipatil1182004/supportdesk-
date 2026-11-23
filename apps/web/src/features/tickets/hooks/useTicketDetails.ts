import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTicketById,
  getTicketComments,
  addTicketComment,
  updateTicket,
} from "../api/tickets.api";

import type { Ticket } from "../../../types/ticket";

export function useTicketDetail(
  token: string | null,
  ticketId: number
) {
  return useQuery({
    queryKey: ["ticket", token, ticketId],
    queryFn: async () => {
      if (!token) throw new Error("Authentication required.");

      const response = await getTicketById(token, ticketId);

      if (!response.data) {
        throw new Error(response.error?.message || "Ticket not found.");
      }

      return response.data;
    },
    enabled: Boolean(token) && ticketId > 0,
  });
}

export function useTicketComments(
  token: string | null,
  ticketId: number
) {
  return useQuery({
    queryKey: ["ticket-comments", token, ticketId],
    queryFn: async () => {
      if (!token) throw new Error("Authentication required.");

      const response = await getTicketComments(token, ticketId);

      if (!response.data) {
        throw new Error(response.error?.message || "Comments not found.");
      }

      return response.data;
    },
    enabled: Boolean(token) && ticketId > 0,
  });
}

export function useAddTicketComment(
  token: string | null,
  ticketId: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      if (!token) throw new Error("Authentication required.");

      const response = await addTicketComment(token, ticketId, body);

      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error("Comment was not returned by the server.");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket-comments", token, ticketId],
      });
    },
  });
}

export function useUpdateTicketStatus(
  token: string | null,
  ticketId: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: Ticket["status"]) => {
      if (!token) throw new Error("Authentication required.");

      const response = await updateTicket(token, ticketId, { status });

      if (response.error) {
        throw new Error(response.error.message);
      }
      if (!response.data) {
        throw new Error("Ticket was not returned by the server.");
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ticket", token, ticketId],
      });

      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });
    },
  });
}