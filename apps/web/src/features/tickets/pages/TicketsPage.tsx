
import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import AppLayout from "../../../components/AppLayout";
import { useTickets } from "../hooks/useTickets";
import type { TicketStatus, TicketPriority } from "../../../types/ticket";

function TicketsPage() {
  const { token } = useAuth();

  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, isFetching } = useTickets(token, {
    page,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
  });

  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;

  function openTicket(ticketId: number) {
    window.location.hash = `#ticket/${ticketId}`;
  }

  const statusColors: Record<TicketStatus, string> = {
    open: "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    in_progress: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
    waiting_on_customer: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    resolved: "bg-green-50 text-green-800 dark:bg-green-950/60 dark:text-green-300",
    closed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              All Tickets
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View and manage support tickets from your database.
            </p>
          </div>

          <button
            onClick={() => {
              window.location.hash = "#new-ticket";
            }}
            className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + New Ticket
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as TicketStatus | "");
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_on_customer">Waiting on Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as TicketPriority | "");
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="">All Priorities</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>

        {isLoading && (
          <p className="rounded-xl bg-white p-6 dark:bg-slate-900 dark:text-slate-300">
            Loading tickets...
          </p>
        )}

        {isError && (
          <div className="rounded-xl bg-rose-50 p-5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <p>
              {error instanceof Error
                ? error.message
                : "Unable to load tickets."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 font-semibold underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {isFetching && (
              <p className="px-5 py-2 text-xs text-blue-600 dark:text-blue-400">
                Updating tickets...
              </p>
            )}

            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/80 dark:text-slate-300">
                <tr>
                  <th className="px-5 py-4">Ticket ID</th>
                  <th className="px-5 py-4">Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openTicket(ticket.id);
                      }
                    }}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-700 dark:text-blue-400">
                      #{ticket.id}
                    </td>

                    <td className="min-w-52 px-5 py-4 font-medium text-slate-800 dark:text-slate-100">
                      {ticket.title}
                      <p className="mt-1 max-w-sm truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                        {ticket.description}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {ticket.category || "General"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">
                      {ticket.priority}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[ticket.status]}`}
                      >
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      No tickets found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total tickets: {pagination?.total ?? 0}
                {" | "}
                Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 0}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Previous
                </button>

                <button
                  disabled={
                    isFetching ||
                    !pagination ||
                    page >= pagination.totalPages
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default TicketsPage;
