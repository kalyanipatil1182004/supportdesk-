import AppLayout from "../../../components/AppLayout";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Tickets", value: "128", icon: "▤", color: "bg-blue-100 text-blue-700", note: "All support requests" },
    { title: "Open Tickets", value: "24", icon: "◷", color: "bg-amber-100 text-amber-700", note: "Awaiting resolution" },
    { title: "Resolved", value: "86", icon: "✓", color: "bg-emerald-100 text-emerald-700", note: "Successfully completed" },
    { title: "Pending", value: "18", icon: "◌", color: "bg-violet-100 text-violet-700", note: "In progress" },
  ];

  const activities = [
    { title: "Dashboard workspace", detail: "Your support workspace is ready.", time: "Workspace" },
    { title: "Account information", detail: "Your account details are available below.", time: "Profile" },
    { title: "Support overview", detail: "View ticket summary and status overview.", time: "Overview" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-7 text-white sm:p-10">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-medium text-blue-200">SUPPORTDESK WORKSPACE</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {user?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Manage your workspace and keep track of your support activities from one place.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Workspace overview
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-8 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
        </section>

        {/* Stats */}
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Overview</h3>
              <p className="mt-1 text-sm text-slate-500">Quick snapshot of your workspace.</p>
            </div>
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
              Demo display data
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl font-bold ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Content */}
        <section className="grid gap-6 xl:grid-cols-3">
          {/* Activity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Workspace Activity</h3>
                <p className="mt-1 text-sm text-slate-500">Your workspace information</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                Recent
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {activities.map((activity, index) => (
                <div key={activity.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">{activity.title}</p>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{activity.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">My Account</h3>
            <p className="mt-1 text-sm text-slate-500">Account information</p>

            <div className="mt-6 flex flex-col items-center rounded-2xl bg-gradient-to-b from-blue-50 to-slate-50 p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-700 text-3xl font-bold text-white shadow-lg shadow-blue-200">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <p className="mt-4 text-lg font-bold text-slate-900">{user?.name || "User"}</p>
              <span className="mt-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {user?.role || "Member"}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email address</p>
                <p className="mt-1 break-all text-sm font-medium text-slate-700">{user?.email || "Not available"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account role</p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-700">{user?.role || "Member"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
              i
            </div>
            <div>
              <h3 className="font-bold text-slate-900">SupportDesk</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                This dashboard is your central workspace. Ticket summary figures are demo UI data and are not yet connected to live ticket records.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;
