
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  useTicketDetail,
  useTicketComments,
  useAddTicketComment,
  useUpdateTicketStatus,
  useApplyTicketSuggestions,
} from "../hooks/useTicketDetails";
import AppLayout from "../../../components/AppLayout";
import Modal from "../../../components/Modal";
import Button from "../../../components/Button";
import type { TicketStatus } from "../../../types/ticket";
import { categoriseTicket, suggestTicketReply } from "../api/ai.api";
import {
  formatAiErrorMessage,
  streamTextResponse,
  type AiProviderName,
  type TicketAiSuggestion,
} from "../api/ai-response";

export default function TicketDetailPage() {
  const { user, token } = useAuth();
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<TicketStatus>("open");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState("");
  const [isSuggestingReply, setIsSuggestingReply] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [suggestion, setSuggestion] = useState<TicketAiSuggestion | null>(null);
  const [categoriseError, setCategoriseError] = useState("");
  const [isCategorising, setIsCategorising] = useState(false);
  const [suggestionsApplied, setSuggestionsApplied] = useState(false);
  const [aiProvider, setAiProvider] = useState<AiProviderName | null>(null);

  const ticketId = Number(window.location.hash.split("/")[1]);

  const ticketQuery = useTicketDetail(token, ticketId);
  const commentsQuery = useTicketComments(token, ticketId);
  const addComment = useAddTicketComment(token, ticketId);
  const updateStatus = useUpdateTicketStatus(token, ticketId);
  const applySuggestions = useApplyTicketSuggestions(token, ticketId);

  const ticket = ticketQuery.data;
  const isAgent = user?.role === "agent" || user?.role === "admin";
  const canAddComment = isAgent;

  async function handleSuggestReply() {
    if (!token) {
      setReplyError("Authentication required. Please sign in again.");
      return;
    }

    setReplyDraft("");
    setReplyError("");
    setCopyMessage("");
    setAiProvider(null);
    setIsSuggestingReply(true);

    try {
      const result = await suggestTicketReply(token, ticketId);
      setAiProvider(result.provider);
      for await (const chunk of streamTextResponse(result.response)) {
        setReplyDraft((current) => current + chunk);
      }
    } catch (error) {
      setReplyError(formatAiErrorMessage(error));
    } finally {
      setIsSuggestingReply(false);
    }
  }

  async function handleCategorise() {
    if (!token) {
      setCategoriseError("Authentication required. Please sign in again.");
      return;
    }

    setCategoriseError("");
    setSuggestion(null);
    setAiProvider(null);
    setSuggestionsApplied(false);
    setIsCategorising(true);

    try {
      const result = await categoriseTicket(token, ticketId);
      setSuggestion(result.suggestion);
      setAiProvider(result.provider);
    } catch (error) {
      setCategoriseError(formatAiErrorMessage(error));
    } finally {
      setIsCategorising(false);
    }
  }

  async function handleCopyDraft() {
    try {
      await navigator.clipboard.writeText(replyDraft);
      setCopyMessage("Draft copied to clipboard.");
      setReplyError("");
    } catch {
      setCopyMessage("");
      setReplyError("Could not copy the draft. Select and copy the text manually.");
    }
  }

  async function handleApplySuggestions() {
    if (!suggestion) return;

    try {
      await applySuggestions.mutateAsync(suggestion);
      setSuggestionsApplied(true);
      setCategoriseError("");
    } catch (error) {
      setCategoriseError(formatAiErrorMessage(error));
    }
  }

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
          <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="relative overflow-hidden border-b border-blue-900/20 bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 px-5 py-5 text-white sm:px-7">
              <div className="pointer-events-none absolute -right-10 -top-20 h-48 w-48 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-5 -top-14 h-36 w-36 rounded-full border border-white/10" />
              <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                SupportDesk AI · {aiProvider === "gemini"
                  ? "Gemini provider"
                  : aiProvider === "mock"
                    ? "Mock provider"
                    : "Provider not reported"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">
                Work through this ticket faster
              </h2>
              <p className="mt-1 text-sm text-blue-100/80">
                Suggestions are drafts only. Nothing is sent or saved unless you choose an action.
              </p>
              </div>
            </div>

            <div className="grid gap-5 bg-slate-50/70 p-5 dark:bg-slate-950/30 sm:p-7 lg:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 transition hover:shadow-md hover:shadow-blue-100/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/10 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Suggested reply
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Review and edit the draft before using it.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void handleSuggestReply()}
                    disabled={isSuggestingReply}
                  >
                    {isSuggestingReply ? "Generating..." : "Suggest Reply"}
                  </Button>
                </div>

                {(replyDraft || isSuggestingReply) && (
                  <label className="mt-4 block">
                    <span className="sr-only">Suggested reply draft</span>
                    <textarea
                      value={replyDraft}
                      onChange={(event) => {
                        setReplyDraft(event.target.value);
                        setCopyMessage("");
                      }}
                      placeholder="Your generated reply draft will appear here..."
                      rows={5}
                      className="w-full resize-y rounded-xl border border-blue-200 bg-blue-50/30 p-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-blue-950"
                    />
                  </label>
                )}

                {replyError && (
                  <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {replyError}
                  </p>
                )}
                {copyMessage && (
                  <p role="status" className="mt-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {copyMessage}
                  </p>
                )}
                {replyDraft.trim() && !isSuggestingReply && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Draft only · not sent to the customer
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => void handleCopyDraft()}
                    >
                      Copy draft
                    </Button>
                  </div>
                )}
              </div>

              <div className="min-w-0 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm shadow-indigo-100/40 transition hover:shadow-md hover:shadow-indigo-100/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/10 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Category &amp; priority
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Review suggestions before applying them.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => void handleCategorise()}
                    disabled={isCategorising}
                  >
                    {isCategorising
                      ? "Analysing..."
                      : "Auto-categorise + Priority"}
                  </Button>
                </div>

                {categoriseError && (
                  <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    {categoriseError}
                  </p>
                )}

                {suggestion && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Suggested category
                        </p>
                        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {suggestion.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Suggested priority
                        </p>
                        <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {suggestion.priority}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Not saved automatically. Apply only after reviewing.
                    </p>
                    {suggestionsApplied ? (
                      <p role="status" className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        Suggestions applied to this ticket.
                      </p>
                    ) : (
                      <Button
                        type="button"
                        className="mt-4"
                        onClick={() => void handleApplySuggestions()}
                        disabled={applySuggestions.isPending}
                      >
                        {applySuggestions.isPending ? "Applying..." : "Apply Suggestions"}
                      </Button>
                    )}
                  </div>
                )}
                {!suggestion && !isCategorising && !categoriseError && (
                  <p className="mt-4 rounded-lg border border-dashed border-violet-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    No suggestions yet. Run categorisation to preview a category and priority.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

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
