import type { ReactNode } from "react";
import { useAuth } from "../features/auth/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: "?" },
    { label: "Tickets", icon: "?" },
    { label: "Profile", icon: "?" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col bg-slate-950 text-white md:flex">
        <div className="border-b border-slate-800 px-7 py-8">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Support<span className="text-blue-400">Desk</span>
          </h2>
          <p className="mt-2 text-xs tracking-widest text-slate-400">
            CUSTOMER SUPPORT PORTAL
          </p>
        </div>

        <nav className="flex-1 px-4 py-7">
          <p className="mb-5 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <div className="space-y-2">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href="#"
                className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200 ${
                  index === 0
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg text-xl">
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-4 mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>
              <p className="text-xs capitalize text-slate-400">
                {user?.role || "Member"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <span>?</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                Workspace
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back to your support workspace.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href="#"
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                index === 0
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            Logout
          </button>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
