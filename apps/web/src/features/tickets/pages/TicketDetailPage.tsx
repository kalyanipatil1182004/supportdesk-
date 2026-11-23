
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  useTicketDetail,
  useTicketComments,
  useAddTicketComment,
  useUpdateTicketStatus,
} from "../hooks/useTicketDetails";
import AppLayout from "../../../components/AppLayout";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import type { TicketStatus } from "../../../types/ticket";

export default function TicketDetailPage() {
  const { user, token } = useAuth();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<TicketStatus>("open");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const ticketId = Number(window.location.hash.split("/")[1]);

  const ticketQuery = useTicketDetail(token, ticketId);
  const commentsQuery = useTicketComments(token, ticketId);
  const addComment = useAddTicketComment(token, ticketId);
  const updateStatus = useUpdateTicketStatus(token, ticketId);

  const ticket = ticketQuery.data;
  const isAgent = user?.role === "agent" || user?.role === "admin";
  const canAddComment = isAgent;

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
    }
  }, [ticket]);

  if (ticketQuery.isLoading) {
    return (
      <AppLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Loading ticket details...
        </div>
      </AppLayout>
    );
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <AppLayout>
        <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/60 dark:bg-slate-900">
          <p className="font-semibold text-rose-700 dark:text-rose-300">
            {ticketQuery.error?.message || "Ticket not found."}
          </p>
          <button
            type="button"
            onClick={() => (window.location.hash = "#tickets")}
            className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back to Tickets
          </button>
        </section>
      </AppLayout>
    );
  }

  async function handleCommentSubmit() {
    if (!comment.trim()) return;

    try {
      await addComment.mutateAsync(comment.trim());
      setComment("");
    } catch {
      // Mutation error is displayed below.
    }
  }

  async function handleStatusUpdate() {
    try {
      await updateStatus.mutateAsync(status);
      setIsStatusModalOpen(false);
    } catch {
      // Mutation error is displayed below.
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => (window.location.hash = "#tickets")}
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <span aria-hidden="true">←</span>
          Back to Tickets
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-400">
                  Ticket #{ticket.id}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {ticket.title}
                </h2>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                {ticket.priority}
              </span>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Description
              </h3>
              <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-300">
                {ticket.description}
              </p>
            </div>

            <div className="grid gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Current status
                </p>
                <p className="mt-1.5 font-semibold capitalize text-slate-900 dark:text-white">
                  {ticket.status.replace(/_/g, " ")}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Category
                </p>
                <p className="mt-1.5 font-semibold text-slate-900 dark:text-white">
                  {ticket.category || "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Created
                </p>
                <p className="mt-1.5 font-semibold text-slate-900 dark:text-white">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {isAgent && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
                Agent tools
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                Update ticket status
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Keep the customer informed by reflecting the latest progress.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="sr-only" htmlFor="ticket-status">
                Ticket status
              </label>
              <select
                id="ticket-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TicketStatus)
                }
                className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_on_customer">Waiting on Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <Button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                disabled={updateStatus.isPending || status === ticket.status}
              >
                Save status
              </Button>
            </div>

            {updateStatus.isError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {updateStatus.error.message}
              </p>
            )}
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:px-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-400">
                Public conversation
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                Comments
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Agent updates are visible to the ticket customer and admins.
              </p>
            </div>
            {commentsQuery.data && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {commentsQuery.data.length}{" "}
                {commentsQuery.data.length === 1 ? "message" : "messages"}
              </span>
            )}
          </div>

          <div className="space-y-4 p-6 sm:p-7">
            {commentsQuery.isLoading && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading comments...
              </p>
            )}

            {commentsQuery.isError && (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                {commentsQuery.error.message}
              </p>
            )}

            {!commentsQuery.isLoading &&
              !commentsQuery.isError &&
              commentsQuery.data?.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    No comments yet
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Agent updates will appear here when they are added.
                  </p>
                </div>
              )}

            <div className="space-y-3">
              {commentsQuery.data?.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-200">
                    {item.body}
                  </p>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    User #{item.authorId}{" "}
                    <span aria-hidden="true">·</span>{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </article>
              ))}
            </div>

            {canAddComment ? (
              <form
                className="border-t border-slate-100 pt-5 dark:border-slate-800"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleCommentSubmit();
                }}
              >
                <label
                  htmlFor="ticket-comment"
                  className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
                >
                  Add a comment
                </label>
                <textarea
                  id="ticket-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share an update or ask a question..."
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                  rows={4}
                />

                {addComment.isError && (
                  <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {addComment.error.message}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Keep your message clear and respectful.
                  </p>
                  <Button
                    type="submit"
                    disabled={!comment.trim() || addComment.isPending}
                  >
                    {addComment.isPending ? "Sending..." : "Send comment"}
                  </Button>
                </div>
              </form>
            ) : (
              <p className="border-t border-slate-100 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                You can view this conversation but cannot add comments.
              </p>
            )}
          </div>
        </section>

        <Modal
          isOpen={isStatusModalOpen}
          title="Confirm status update"
          onClose={() => setIsStatusModalOpen(false)}
        >
          <div className="space-y-5">
            <p>
              Are you sure you want to change the ticket status to{" "}
              <strong className="capitalize">
                {status.replace(/_/g, " ")}
              </strong>
              ?
            </p>

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={updateStatus.isPending}
              >
                Cancel
              </Button>

              <Button
                onClick={() => void handleStatusUpdate()}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Updating..." : "Confirm Update"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
