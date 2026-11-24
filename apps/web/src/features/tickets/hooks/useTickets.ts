import { useQuery } from "@tanstack/react-query";
import { getTickets } from "../api/tickets.api";
import type { TicketListParams } from "../../../types/ticket";

export function useTickets(
  token: string | null,
  filters: TicketListParams = {}
) {
  return useQuery({
    queryKey: ["tickets", token, filters],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication required.");
      }

      const response = await getTickets(token, filters);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        tickets: response.data ?? [],
        pagination: response.meta.pagination,
      };
    },
    enabled: Boolean(token),
  });
}
