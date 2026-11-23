import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { loginAndNavigateToDashboard } from "../login-navigation";

interface LoginFormData {
  email: string;
  password: string;
}

function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setServerError("");

    try {
      await loginAndNavigateToDashboard(
        login,
        data,
        (hash) => {
          window.location.hash = hash;
        }
      );
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 transition-colors sm:px-8 dark:bg-slate-950">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30 dark:bg-slate-900 dark:shadow-black/60 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-12 text-white lg:flex">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-400/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold ring-1 ring-white/20">
                S
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">SupportDesk</h1>
                <p className="text-xs text-blue-200">Customer Support Platform</p>
              </div>
            </div>

            <div className="mt-24 max-w-md">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Welcome aboard
              </p>
              <h2 className="text-4xl font-bold leading-tight">
                Support that
                <br />
                makes a difference.
              </h2>
              <p className="mt-6 max-w-sm leading-7 text-blue-100/80">
                A smarter workspace to manage support requests, stay organized
                and deliver a better customer experience.
              </p>
            </div>
          </div>

          <div className="relative flex items-center gap-3 text-sm text-blue-100/70">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            Your support workspace, all in one place.
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-200">
                  S
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    SupportDesk
                  </h1>
                  <p className="text-xs text-slate-500">
                    Customer Support Platform
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-blue-600">
                YOUR WORKSPACE
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Welcome back! Enter your details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  aria-invalid={Boolean(errors.email)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...register("email", {
                    required: "Email is required",
                  })}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">SUPPORTDESK</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Secure access to your customer support workspace.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
