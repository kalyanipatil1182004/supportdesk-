import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { loginUser } from "../api/auth.api";
import type { PublicUser, LoginRequest } from "../../../types/auth";

interface AuthContextType {
  user: PublicUser | null;
  token: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function login(credentials: LoginRequest) {
    const result = await loginUser(credentials);

    if (!result.data) {
      throw new Error("Login failed");
    }

    setUser(result.data.user);
    setToken(result.data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
