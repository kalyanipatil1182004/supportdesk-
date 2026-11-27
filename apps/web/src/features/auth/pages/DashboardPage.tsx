
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import AppLayout from "../../../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../../tickets/hooks/useTickets";
import { useUserDirectory } from "../hooks/useAdminCustomers";
import type { DirectoryAccount } from "../api/customers.api";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DirectoryData {
  users: DirectoryAccount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function DirectoryPanel({
  title,
  roleLabel,
  accent,
  directory,
  page,
  onPageChange,
}: {
  title: string;
  roleLabel: string;
  accent: "sky" | "violet";
  directory: UseQueryResult<DirectoryData, Error>;
  page: number;
  onPageChange: Dispatch<SetStateAction<number>>;
}) {
  const isSky = accent === "sky";

  return (
    <section
      className={`group overflow-hidden rounded-2xl border bg-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:bg-slate-900 dark:shadow-black/20 ${
        isSky
          ? "border-sky-100 shadow-sky-100/60 hover:shadow-sky-100/80 dark:border-slate-800"
          : "border-violet-100 shadow-violet-100/60 hover:shadow-violet-100/80 dark:border-slate-800"
      }`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 dark:border-slate-800 ${
          isSky
            ? "border-sky-100 bg-sky-50/70 dark:bg-sky-950/20"
            : "border-violet-100 bg-violet-50/70 dark:bg-violet-950/20"
        }`}
      >
        <div>
          <h4 className="font-sans text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h4>
          <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400">
            Account directory
          </p>
        </div>
        {directory.data && (
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              isSky
                ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                : "bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300"
            }`}
          >
            {directory.data.pagination.total} total
          </span>
        )}
      </div>
      {directory.isLoading ? (
        <p role="status" className="p-5 text-sm text-slate-500 dark:text-slate-400">
          Loading {title.toLowerCase()}...
        </p>
      ) : directory.isError ? (
        <p role="alert" className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          {directory.error.message}
        </p>
      ) : directory.data?.users.length ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs">
              <thead className="bg-slate-50 font-sans text-[10px] uppercase tracking-[0.12em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  <th className="w-[30%] px-3 py-2.5 font-semibold sm:px-4">{roleLabel}</th>
                  <th className="w-[45%] px-3 py-2.5 font-semibold sm:px-4">Email</th>
                  <th className="w-[25%] px-3 py-2.5 font-semibold sm:px-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {directory.data.users.map((account) => (
                  <tr
                    key={account.id}
                    className={`transition-colors ${
                      isSky
                        ? "hover:bg-sky-50/60 dark:hover:bg-slate-800/50"
                        : "hover:bg-violet-50/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <td className="break-words px-3 py-3 font-sans font-medium tracking-tight text-slate-800 dark:text-slate-100 sm:px-4">
                      {account.name}
                    </td>
                    <td className="break-all px-3 py-3 text-slate-600 dark:text-slate-300 sm:px-4">
                      {account.email}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[10px] text-slate-500 dark:text-slate-400 sm:px-4 sm:text-xs">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page {directory.data.pagination.page} of {directory.data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || directory.isFetching}
                onClick={() => onPageChange((current) => current - 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  directory.isFetching ||
                  page >= directory.data.pagination.totalPages
                }
                onClick={() => onPageChange((current) => current + 1)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
          No {title.toLowerCase()} accounts found.
        </p>
      )}
    </section>
  );
}

function DashboardPage() {
  const { user, token } = useAuth();
  const [customerPage, setCustomerPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [activeQueue, setActiveQueue] = useState<
    "open" | "in_progress" | "resolved"
  >("open");
  const [ticketPage, setTicketPage] = useState(1);
  const canViewDirectory = user?.role === "agent" || user?.role === "admin";

  // Each query returns the actual count from the database.
  const allTickets = useTickets(token, { page: 1, limit: 1 });
  const openTickets = useTickets(token, {
    page: 1,
    limit: 1,
    status: "open",
  });
  const inProgressTickets = useTickets(token, {
    page: 1,
    limit: 1,
    status: "in_progress",
  });
  const resolvedTickets = useTickets(token, {
    page: 1,
    limit: 1,
    status: "resolved",
  });
  const waitingOnCustomerTickets = useTickets(token, {
    page: 1,
    limit: 1,
    status: "waiting_on_customer",
  });
  const closedTickets = useTickets(token, {
    page: 1,
    limit: 1,
    status: "closed",
  });
  const recentTickets = useTickets(token, {
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const selectedTickets = useTickets(token, {
    page: ticketPage,
    limit: 5,
    status: activeQueue,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const customers = useUserDirectory(
    token,
    customerPage,
    "customer",
    canViewDirectory
  );
  const admins = useUserDirectory(token, adminPage, "admin", canViewDirectory);

  const queries = [
    allTickets,
    openTickets,
    inProgressTickets,
    waitingOnCustomerTickets,
    resolvedTickets,
    closedTickets,
    recentTickets,
  ];

  const isLoading = queries.some((query) => query.isLoading);
  const hasError = queries.some((query) => query.isError);

  const statusChartData = [
    {
      status: "Open",
      count: openTickets.data?.pagination.total ?? 0,
      fill: "#7dd3fc",
    },
    {
      status: "In Progress",
      count: inProgressTickets.data?.pagination.total ?? 0,
      fill: "#c4b5fd",
    },
    {
      status: "Waiting on Customer",
      count: waitingOnCustomerTickets.data?.pagination.total ?? 0,
      fill: "#fdba74",
    },
    {
      status: "Resolved",
      count: resolvedTickets.data?.pagination.total ?? 0,
      fill: "#6ee7b7",
    },
    {
      status: "Closed",
      count: closedTickets.data?.pagination.total ?? 0,
      fill: "#fda4af",
    },
  ];

  const statusQueries = [
    openTickets,
    inProgressTickets,
    waitingOnCustomerTickets,
    resolvedTickets,
    closedTickets,
  ];
  const statusIsLoading = statusQueries.some((query) => query.isLoading);
  const statusHasError = statusQueries.some((query) => query.isError);

  const trendData = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const count = (recentTickets.data?.tickets ?? []).filter((ticket) => {
        const createdAt = new Date(ticket.createdAt);
        if (Number.isNaN(createdAt.getTime())) {
          return false;
        }

        const createdAtKey = [
          createdAt.getFullYear(),
          String(createdAt.getMonth() + 1).padStart(2, "0"),
          String(createdAt.getDate()).padStart(2, "0"),
        ].join("-");

        return createdAtKey === dateKey;
      }).length;

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        tickets: count,
      };
    });
  })();

  const stats = [
    {
      title: "Total Tickets",
      value: allTickets.data?.pagination.total ?? 0,
      icon: "ALL",
      color: "bg-sky-100 text-sky-700",
      surface: "border-sky-100 from-sky-50/90 to-white shadow-sky-100/70",
      note: "All support requests",
    },
    {
      title: "Open Tickets",
      value: openTickets.data?.pagination.total ?? 0,
      icon: "NEW",
      color: "bg-orange-100 text-orange-700",
      surface: "border-orange-100 from-orange-50/90 to-white shadow-orange-100/70",
      note: "Awaiting resolution",
    },
    {
      title: "In Progress",
      value: inProgressTickets.data?.pagination.total ?? 0,
      icon: "LIVE",
      color: "bg-violet-100 text-violet-700",
      surface: "border-violet-100 from-violet-50/90 to-white shadow-violet-100/70",
      note: "Currently being handled",
    },
    {
      title: "Resolved",
      value: resolvedTickets.data?.pagination.total ?? 0,
      icon: "DONE",
      color: "bg-emerald-100 text-emerald-700",
      surface: "border-emerald-100 from-emerald-50/90 to-white shadow-emerald-100/70",
      note: "Successfully completed",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-blue-900/20 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-5 text-white shadow-xl shadow-blue-900/20 sm:rounded-3xl sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-semibold text-blue-200">
              SUPPORTDESK WORKSPACE
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100/90 sm:text-base">
              Manage your workspace and keep track of your support activities from one place.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-blue-50 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live workspace overview
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-8 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live snapshot of your workspace.
              </p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300">
              Live database data
            </span>
          </div>

          {hasError && (
            <p className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              Unable to load ticket statistics. Please refresh the page or log in again.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className={`group rounded-2xl border bg-gradient-to-br p-4 shadow-md transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900 dark:shadow-black/10 dark:hover:shadow-black/25 ${stat.surface}`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <div
                    className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[9px] font-extrabold tracking-wide ${stat.color} sm:h-11`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:mt-5">
                  {isLoading ? "..." : hasError ? "—" : stat.value}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-7">
            <div>
              <h4 className="font-sans text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                Ticket list
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose a status to see its tickets.
              </p>
            </div>
            <div
              className="mx-auto mt-4 flex w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 sm:mt-5 sm:p-2"
              role="tablist"
              aria-label="Filter dashboard tickets by status"
            >
              {[
                {
                  title: "Open",
                  status: "open" as const,
                  query: openTickets,
                  active: "bg-sky-600 text-white shadow-sm",
                },
                {
                  title: "In Progress",
                  status: "in_progress" as const,
                  query: inProgressTickets,
                  active: "bg-violet-600 text-white shadow-sm",
                },
                {
                  title: "Resolved",
                  status: "resolved" as const,
                  query: resolvedTickets,
                  active: "bg-emerald-600 text-white shadow-sm",
                },
              ].map(({ title, status, query, active }) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  id={`dashboard-tab-${status}`}
                  aria-selected={activeQueue === status}
                  aria-controls="dashboard-ticket-list"
                  onClick={() => {
                    setActiveQueue(status);
                    setTicketPage(1);
                  }}
                  className={`inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-1.5 py-3 text-xs font-bold tracking-tight transition duration-200 sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm ${
                    activeQueue === status
                      ? active
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="whitespace-nowrap">{title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-xs ${
                      activeQueue === status
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {query.data?.pagination.total ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            id="dashboard-ticket-list"
            role="tabpanel"
            aria-labelledby={`dashboard-tab-${activeQueue}`}
            className={`mt-4 overflow-hidden rounded-2xl border bg-white shadow-lg transition-shadow duration-200 hover:shadow-xl dark:bg-slate-900 dark:shadow-black/20 ${
              activeQueue === "open"
                ? "border-sky-100 shadow-sky-100/60 dark:border-slate-800"
                : activeQueue === "in_progress"
                  ? "border-violet-100 shadow-violet-100/60 dark:border-slate-800"
                  : "border-emerald-100 shadow-emerald-100/60 dark:border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/30 sm:px-5 sm:py-4">
              <div>
                <h4 className="font-sans text-sm font-semibold text-slate-900 dark:text-white">
                  {activeQueue === "in_progress"
                    ? "In Progress Tickets"
                    : `${activeQueue[0].toUpperCase()}${activeQueue.slice(1)} Tickets`}
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {selectedTickets.data?.pagination.total ?? 0} tickets
                </p>
              </div>
              {selectedTickets.isFetching && (
                <span role="status" className="text-xs text-blue-600 dark:text-blue-400">
                  Updating...
                </span>
              )}
            </div>
            {selectedTickets.isLoading ? (
              <p role="status" className="p-5 text-sm text-slate-500 dark:text-slate-400">
                Loading tickets...
              </p>
            ) : selectedTickets.isError ? (
              <p role="alert" className="p-5 text-sm text-rose-700 dark:text-rose-300">
                {selectedTickets.error.message}
              </p>
            ) : selectedTickets.data?.tickets.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedTickets.data.tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <a
                      href={`#ticket/${ticket.id}`}
                      className={`group flex min-w-0 items-start gap-3 border-l-[3px] px-4 py-4 transition duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:px-5 ${
                        activeQueue === "open"
                          ? "border-l-sky-300 hover:bg-sky-50/70 dark:hover:bg-sky-950/20"
                          : activeQueue === "in_progress"
                            ? "border-l-violet-300 hover:bg-violet-50/70 dark:hover:bg-violet-950/20"
                            : "border-l-emerald-300 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/20"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <span className="break-words text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-800 dark:text-slate-100 dark:group-hover:text-blue-300">
                            {ticket.title}
                          </span>
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            #{ticket.id}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                          {ticket.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-xs">
                          <span className="rounded-full bg-white px-2 py-1 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                            Priority {ticket.priority}
                          </span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                No {activeQueue.replace("_", " ")} tickets right now.
              </p>
            )}
            {selectedTickets.data &&
              selectedTickets.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page {selectedTickets.data.pagination.page} of{" "}
                    {selectedTickets.data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={ticketPage <= 1 || selectedTickets.isFetching}
                      onClick={() => setTicketPage((page) => page - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={
                        selectedTickets.isFetching ||
                        ticketPage >= selectedTickets.data.pagination.totalPages
                      }
                      onClick={() => setTicketPage((page) => page + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
          </div>
        </section>

        {canViewDirectory && (
          <section>
            <div className="mb-4">
              <h3 className="font-sans text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                Customer &amp; Admin
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Workspace account lists
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <DirectoryPanel
                title="Customers"
                roleLabel="Customer"
                accent="sky"
                directory={customers}
                page={customerPage}
                onPageChange={setCustomerPage}
              />
              <DirectoryPanel
                title="Admins"
                roleLabel="Admin"
                accent="violet"
                directory={admins}
                page={adminPage}
                onPageChange={setAdminPage}
              />
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-sky-100 bg-white p-4 shadow-lg shadow-sky-100/50 transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
            <div className="mb-4 sm:mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ticket Creation Trend
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Last 7 days
              </p>
            </div>

            {recentTickets.isLoading ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-sky-50/70 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:h-72">
                Loading ticket trend...
              </div>
            ) : recentTickets.isError ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:h-72">
                Unable to load recent ticket data.
              </div>
            ) : (
              <div
                className="h-64 w-full sm:h-72"
                role="img"
                aria-label="Line chart showing ticket creation counts for the last seven days"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 12, right: 10, left: -18, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="ticketTrendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7dd3fc" stopOpacity={0.42} />
                        <stop offset="100%" stopColor="#a7f3d0" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="#dbeafe"
                      strokeDasharray="3 6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <Tooltip
                      cursor={{ stroke: "#bae6fd", strokeWidth: 1, strokeDasharray: "4 4" }}
                      labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: 4 }}
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid #dbeafe",
                        backgroundColor: "#ffffff",
                        color: "#1e293b",
                        fontSize: "12px",
                        boxShadow: "0 12px 28px rgba(56, 189, 248, 0.16)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      name="Tickets"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      fill="url(#ticketTrendFill)"
                      isAnimationActive={false}
                      dot={{ fill: "#ffffff", stroke: "#38bdf8", strokeWidth: 2.5, r: 3 }}
                      activeDot={{ fill: "#34d399", stroke: "#ffffff", strokeWidth: 3, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-violet-100 bg-white p-4 shadow-lg shadow-violet-100/50 transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-6">
            <div className="mb-4 sm:mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ticket Status Distribution
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Compare tickets across each status
              </p>
            </div>

            {statusIsLoading ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-violet-50/60 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300 sm:h-72">
                Loading ticket statuses...
              </div>
            ) : statusHasError ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300 sm:h-72">
                Unable to load ticket status data.
              </div>
            ) : (
              <div
                className="h-64 w-full sm:h-72"
                role="img"
                aria-label="Horizontal bar chart showing ticket totals for open, in progress, waiting on customer, resolved and closed statuses"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusChartData}
                    layout="vertical"
                    margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke="#e0e7ff"
                      strokeDasharray="3 6"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      type="category"
                      dataKey="status"
                      width={112}
                      tick={{ fill: "#475569", fontSize: 10, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f5f3ff", radius: 8 }}
                      labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: 4 }}
                      contentStyle={{
                        borderRadius: "14px",
                        border: "1px solid #ede9fe",
                        backgroundColor: "#ffffff",
                        color: "#1e293b",
                        fontSize: "12px",
                        boxShadow: "0 12px 28px rgba(167, 139, 250, 0.16)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Tickets"
                      radius={[0, 8, 8, 0]}
                      maxBarSize={26}
                      isAnimationActive={false}
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Workspace Activity
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Your workspace information
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Recent
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  title: "Ticket statistics",
                  detail: "Your ticket counts are loaded from the database.",
                  time: "Live",
                },
                {
                  title: "Account information",
                  detail: "Your account details are available below.",
                  time: "Profile",
                },
                {
                  title: "Support overview",
                  detail: "Track your support ticket status.",
                  time: "Overview",
                },
              ].map((activity, index) => (
                <div key={activity.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-5 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {activity.title}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {activity.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">My Account</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Account information</p>

            <div className="mt-6 flex flex-col items-center rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 p-6 dark:from-slate-800 dark:to-slate-950">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white shadow-lg shadow-blue-200">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                {user?.name || "User"}
              </p>
              <span className="mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {user?.role || "Member"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Email address
                </p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.email || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Account role
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                  {user?.role || "Member"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              i
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">SupportDesk</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Your dashboard displays live ticket statistics from your SupportDesk database.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;
