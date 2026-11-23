
import { useEffect, useState } from "react";
import LoginPage from "./features/auth/pages/LoginPage";
import DashboardPage from "./features/auth/pages/DashboardPage";
import TicketsPage from "./features/tickets/pages/TicketsPage";
import NewTicketPage from "./features/tickets/pages/NewTicketPage";
import TicketDetailPage from "./features/tickets/pages/TicketDetailPage";
import { AuthProvider } from "./features/auth/context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function getCurrentPage() {
  const hash = window.location.hash;

  if (hash.startsWith("#ticket/")) {
    return "ticket-detail";
  }

  if (hash === "#tickets") {
    return "tickets";
  }

  if (hash === "#new-ticket") {
    return "new-ticket";
  }

  return "dashboard";
}

function AppContent() {
  const [page, setPage] = useState(getCurrentPage);

  useEffect(() => {
    const savedTheme = localStorage.getItem("supportdesk-theme");
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    const handleHashChange = () => setPage(getCurrentPage());

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const currentPage =
    page === "ticket-detail" ? <TicketDetailPage /> :
    page === "tickets" ? <TicketsPage /> :
    page === "new-ticket" ? <NewTicketPage /> :
    <DashboardPage />;

  return (
    <ProtectedRoute fallback={<LoginPage />}>
      {currentPage}
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
