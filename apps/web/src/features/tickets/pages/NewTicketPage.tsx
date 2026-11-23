import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/AuthContext";
import AppLayout from "../../../components/AppLayout";
import { createTicket } from "../api/tickets.api";

function NewTicketPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"P1" | "P2" | "P3" | "P4">("P3");
  const [category, setCategory] = useState("General");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Please log in again.");
      const response = await createTicket(token, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category.trim() || undefined,
      });
      if (response.error) throw new Error(response.error.message);
      if (!response.data) throw new Error("Ticket was not returned by the server.");
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      window.location.hash = "#tickets";
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Ticket</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter the issue details to create a support ticket.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div>
            <label htmlFor="ticket-title" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Ticket Title
            </label>
            <input
              id="ticket-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={150}
              required
              placeholder="Example: Unable to login to account"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950"
            />
          </div>

          <div>
            <label htmlFor="ticket-description" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Description
            </label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={5}
              maxLength={2000}
              required
              rows={5}
              placeholder="Explain your issue..."
              className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ticket-category" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Category
              </label>
              <select
                id="ticket-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              >
                <option>General</option>
                <option>Technical</option>
                <option>Account</option>
                <option>Network</option>
                <option>Billing</option>
              </select>
            </div>

            <div>
              <label htmlFor="ticket-priority" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Priority
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as "P1" | "P2" | "P3" | "P4")}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              >
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>
          </div>

          {mutation.isError && (
            <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {mutation.error instanceof Error ? mutation.error.message : "Unable to create ticket."}
            </p>
          )}

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "Creating..." : "Create Ticket"}
            </button>
            <button
              type="button"
              onClick={() => { window.location.hash = "#tickets"; }}
              className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default NewTicketPage;
