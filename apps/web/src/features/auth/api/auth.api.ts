import { apiRequest } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";
import type {
  LoginRequest,
  LoginResponseData,
} from "../../../types/auth";

export async function loginUser(
  credentials: LoginRequest
): Promise<ApiEnvelope<LoginResponseData>> {
  return apiRequest<ApiEnvelope<LoginResponseData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
