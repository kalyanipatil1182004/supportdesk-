import AppLayout from "../../../components/AppLayout";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name}
          </h2>
          <p className="mt-1 text-slate-500">
            Here is your SupportDesk account overview.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">User Name</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {user?.name}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Email Address</p>
            <p className="mt-2 break-all text-lg font-semibold text-slate-900">
              {user?.email}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Account Role</p>
            <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
              {user?.role}
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

export default DashboardPage;
