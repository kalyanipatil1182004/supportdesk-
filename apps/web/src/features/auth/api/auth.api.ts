import { apiRequest } from "../../../lib/api";
import type { ApiEnvelope } from "../../../types/api";
import type {
  LoginRequest,
  LoginResponseData,
  PublicUser,
} from "../../../types/auth";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export async function loginUser(
  credentials: LoginRequest
): Promise<ApiEnvelope<LoginResponseData>> {
  return apiRequest<ApiEnvelope<LoginResponseData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function registerUser(
  credentials: RegisterRequest
): Promise<ApiEnvelope<{ user: PublicUser }>> {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}
