import { useQuery } from "@tanstack/react-query";
import { getUserDirectory } from "../api/customers.api";

export function useUserDirectory(
  token: string | null,
  page: number,
  role: "customer" | "admin",
  enabled: boolean
) {
  return useQuery({
    queryKey: ["user-directory", token, role, page],
    queryFn: async () => {
      if (!token) {
        throw new Error("Authentication required.");
      }

      const response = await getUserDirectory(token, page, role);
      if (response.error) {
        throw new Error(response.error.message);
      }

      return {
        users: response.data ?? [],
        pagination: response.meta.pagination,
      };
    },
    enabled: Boolean(token) && enabled,
  });
}
