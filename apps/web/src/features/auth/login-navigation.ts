import type { LoginRequest } from "../../types/auth";

export async function loginAndNavigateToDashboard(
  login: (credentials: LoginRequest) => Promise<void>,
  credentials: LoginRequest,
  navigate: (hash: string) => void
): Promise<void> {
  await login(credentials);
  navigate("#dashboard");
}
