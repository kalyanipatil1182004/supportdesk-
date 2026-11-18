import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/auth/pages/DashboardPage";
import { AuthProvider } from "./features/auth/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<LoginPage />}>
        <DashboardPage />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
