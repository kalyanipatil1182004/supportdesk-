import { apiRequest } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";

export interface DirectoryAccount {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserDirectoryResponse
  extends ApiEnvelope<DirectoryAccount[]> {
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function getUserDirectory(
  token: string,
  page: number,
  role: "customer" | "admin"
): Promise<UserDirectoryResponse> {
  return apiRequest<UserDirectoryResponse>(
    `/users/${role === "customer" ? "customers" : "admins"}?page=${page}&limit=10`,
    { token }
  );
}
