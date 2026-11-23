
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../features/auth/context/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("supportdesk-theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem(
      "supportdesk-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const currentHash =
    typeof window !== "undefined" ? window.location.hash : "#dashboard";

  const currentPage = currentHash.startsWith("#ticket/")
    ? "tickets"
    : currentHash.replace("#", "") || "dashboard";


  const navItems =
    user?.role?.toLowerCase() === "admin"
      ? [
          { label: "Overview", icon: "📊", href: "#dashboard", id: "dashboard" },
          { label: "Ticket List", icon: "🎫", href: "#tickets", id: "tickets" },
        ]
      : [
          { label: "Overview", icon: "📊", href: "#dashboard", id: "dashboard" },
          { label: "Tickets", icon: "🎫", href: "#tickets", id: "tickets" },
          { label: "New Ticket", icon: "➕", href: "#new-ticket", id: "new-ticket" },
        ];


  const pageTitle =
    navItems.find((item) => item.id === currentPage)?.label || "Ticket Details";

  return (
    <div className="min-h-screen bg-[#f4f7ff] text-slate-800 transition-colors dark:bg-slate-950 dark:text-slate-100 md:flex">
      <aside className="hidden w-72 shrink-0 flex-col bg-[#172554] text-white dark:bg-slate-950 md:flex">
        <div className="border-b border-white/10 px-7 py-8">
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
            {navItems.map((item) => {
              const active = currentPage === item.id;

              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-xl border-l-4 px-4 py-3.5 text-sm font-medium transition ${
                    active
                      ? "border-blue-400 bg-[#1e40af] text-white"
                      : "border-transparent text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-2xl">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="mx-4 mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
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
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-5 py-5 transition-colors dark:border-slate-800 dark:bg-slate-900 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                Workspace
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Welcome back to your support workspace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDarkMode((current) => !current)}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDarkMode}
                title={isDarkMode ? "Light mode" : "Dark mode"}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-lg text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:border-blue-500 dark:hover:bg-slate-700"
              >
                {isDarkMode ? "☀" : "☾"}
              </button>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-800 dark:bg-blue-900/70 dark:text-blue-200">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
                currentPage === item.id
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </a>
          ))}

          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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
