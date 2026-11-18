import type { ReactNode } from "react";
import { useAuth } from "../features/auth/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 bg-slate-900 p-6 text-white md:block">
        <h2 className="text-2xl font-bold">SupportDesk</h2>
        <p className="mt-2 text-sm text-slate-400">Customer Support Portal</p>

        <nav className="mt-10 space-y-2">
          <a href="#" className="block rounded-lg bg-blue-600 px-4 py-3 font-medium">
            Dashboard
          </a>
          <a href="#" className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            Tickets
          </a>
          <a href="#" className="block rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800">
            Profile
          </a>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome to SupportDesk</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
