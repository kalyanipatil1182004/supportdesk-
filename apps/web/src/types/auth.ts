export type UserRole = "customer" | "agent" | "admin";

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: PublicUser;
  token: string;
}
