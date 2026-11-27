import type { ReactNode } from "react";
import { useAuth } from "../features/auth/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
