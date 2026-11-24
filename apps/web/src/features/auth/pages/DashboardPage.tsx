
import AppLayout from "../../../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../../tickets/hooks/useTickets";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function DashboardPage() {
  const { user, token } = useAuth();

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
      fill: "#2563eb",
    },
    {
      status: "In Progress",
      count: inProgressTickets.data?.pagination.total ?? 0,
      fill: "#1d4ed8",
    },
    {
      status: "Waiting on Customer",
      count: waitingOnCustomerTickets.data?.pagination.total ?? 0,
      fill: "#60a5fa",
    },
    {
      status: "Resolved",
      count: resolvedTickets.data?.pagination.total ?? 0,
      fill: "#38bdf8",
    },
    {
      status: "Closed",
      count: closedTickets.data?.pagination.total ?? 0,
      fill: "#64748b",
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
      icon: "?",
      color: "bg-blue-100 text-blue-700",
      note: "All support requests",
    },
    {
      title: "Open Tickets",
      value: openTickets.data?.pagination.total ?? 0,
      icon: "?",
      color: "bg-amber-100 text-amber-700",
      note: "Awaiting resolution",
    },
    {
      title: "In Progress",
      value: inProgressTickets.data?.pagination.total ?? 0,
      icon: "?",
      color: "bg-violet-100 text-violet-700",
      note: "Currently being handled",
    },
    {
      title: "Resolved",
      value: resolvedTickets.data?.pagination.total ?? 0,
      icon: "?",
      color: "bg-blue-100 text-blue-700",
      note: "Successfully completed",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-7 text-white sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-medium text-blue-200">
              SUPPORTDESK WORKSPACE
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Manage your workspace and keep track of your support activities from one place.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Live workspace overview
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-8 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
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
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </p>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {isLoading ? "..." : hasError ? "—" : stat.value}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ticket Creation Trend
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Last 7 days
              </p>
            </div>

            {recentTickets.isLoading ? (
              <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Loading ticket trend...
              </div>
            ) : recentTickets.isError ? (
              <div className="flex h-72 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Unable to load recent ticket data.
              </div>
            ) : (
              <div
                className="h-72 w-full"
                role="img"
                aria-label="Line chart showing ticket creation counts for the last seven days"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={{ stroke: "#94a3b8" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ stroke: "#93c5fd", strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #475569",
                        backgroundColor: "#0f172a",
                        color: "#f8fafc",
                        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      name="Tickets"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      activeDot={{ fill: "#1d4ed8", stroke: "#bfdbfe", strokeWidth: 3, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ticket Status Distribution
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Total tickets by status
              </p>
            </div>

            {statusIsLoading ? (
              <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                Loading ticket statuses...
              </div>
            ) : statusHasError ? (
              <div className="flex h-72 items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 text-center text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                Unable to load ticket status data.
              </div>
            ) : (
              <div
                className="h-72 w-full"
                role="img"
                aria-label="Bar chart showing the total number of tickets for each support status"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusChartData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 24 }}
                  >
                    <CartesianGrid
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="status"
                      interval={0}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={{ stroke: "#94a3b8" }}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#eff6ff" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #475569",
                        backgroundColor: "#0f172a",
                        color: "#f8fafc",
                        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Tickets"
                      fill="#2563eb"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={56}
                    />
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
