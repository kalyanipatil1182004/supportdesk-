
import { useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import AppLayout from "../../../components/AppLayout";
import Badge from "../../../components/Badge";
import Button from "../../../components/Button";
import Table from "../../../components/Table";
import { useTickets } from "../hooks/useTickets";
import type { Ticket, TicketStatus, TicketPriority } from "../../../types/ticket";

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

  const statusVariants: Record<
    TicketStatus,
    "blue" | "indigo" | "amber" | "green" | "slate"
  > = {
    open: "blue",
    in_progress: "indigo",
    waiting_on_customer: "amber",
    resolved: "green",
    closed: "slate",
  };

  const columns = [
    {
      key: "id",
      header: "Ticket ID",
      className: "whitespace-nowrap font-semibold text-blue-700 dark:text-blue-400",
      render: (ticket: Ticket) => `#${ticket.id}`,
    },
    {
      key: "title",
      header: "Title",
      className: "min-w-52 font-medium text-slate-800 dark:text-slate-100",
      render: (ticket: Ticket) => (
        <>
          {ticket.title}
          <p className="mt-1 max-w-sm truncate text-xs font-normal text-slate-500 dark:text-slate-400">
            {ticket.description}
          </p>
        </>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (ticket: Ticket) => ticket.category || "General",
    },
    {
      key: "priority",
      header: "Priority",
      className: "whitespace-nowrap font-semibold",
      render: (ticket: Ticket) => ticket.priority,
    },
    {
      key: "status",
      header: "Status",
      className: "whitespace-nowrap",
      render: (ticket: Ticket) => (
        <Badge variant={statusVariants[ticket.status]}>
          {ticket.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      className: "whitespace-nowrap text-slate-500 dark:text-slate-400",
      render: (ticket: Ticket) =>
        new Date(ticket.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#dashboard";
              }}
              className="mb-3 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span aria-hidden="true">←</span>
              Back to Overview
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              All Tickets
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View and manage support tickets from your database.
            </p>
          </div>

          <Button
            onClick={() => {
              window.location.hash = "#new-ticket";
            }}
          >
            + New Ticket
          </Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            aria-label="Filter tickets by status"
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
            aria-label="Filter tickets by priority"
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
          <p
            role="status"
            className="rounded-xl bg-white p-6 dark:bg-slate-900 dark:text-slate-300"
          >
            Loading tickets...
          </p>
        )}

        {isError && (
          <div
            role="alert"
            className="rounded-xl bg-rose-50 p-5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <p>
              {error instanceof Error
                ? error.message
                : "Unable to load tickets."}
            </p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {isFetching && (
              <p
                role="status"
                className="px-5 py-2 text-xs text-blue-600 dark:text-blue-400"
              >
                Updating tickets...
              </p>
            )}

            <Table
              aria-label="Support tickets"
              columns={columns}
              data={tickets}
              getRowKey={(ticket) => ticket.id}
              getRowLabel={(ticket) =>
                `Open ticket ${ticket.id}: ${ticket.title}`
              }
              onRowClick={(ticket) => openTicket(ticket.id)}
              emptyMessage="No tickets found. Try changing your filters."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total tickets: {pagination?.total ?? 0}
                {" | "}
                Page {pagination?.page ?? 1} of {pagination?.totalPages ?? 0}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((current) => current - 1)}
                  className="px-4 py-2"
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  disabled={
                    isFetching ||
                    !pagination ||
                    page >= pagination.totalPages
                  }
                  onClick={() => setPage((current) => current + 1)}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default TicketsPage;
