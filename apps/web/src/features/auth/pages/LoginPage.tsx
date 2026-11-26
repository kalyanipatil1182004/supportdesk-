import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { loginAndNavigateToDashboard } from "../login-navigation";
import { registerUser } from "../api/auth.api";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  name: string;
}

function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const {
    register: registerAccount,
    handleSubmit: handleRegistrationSubmit,
    formState: {
      errors: registrationErrors,
      isSubmitting: isRegisteringAccount,
    },
  } = useForm<RegisterFormData>();

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setServerError("");
    setFormMessage("");

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

  const onRegister: SubmitHandler<RegisterFormData> = async (data) => {
    setServerError("");
    setFormMessage("");

    try {
      await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      setIsRegistering(false);
      setFormMessage("Customer account created. Sign in to continue.");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Unable to create account."
      );
    }
  };

  function showForgotPasswordHelp() {
    setServerError("");
    setFormMessage(
      "Password reset is not available here. Please contact your SupportDesk administrator."
    );
  }

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
                {isRegistering ? "Create your account" : "Welcome Back!"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {isRegistering
                  ? "Create a customer account to submit and track support tickets."
                  : "Sign in to your SupportDesk workspace."}
              </p>
            </div>

            {isRegistering ? (
            <form
              onSubmit={handleRegistrationSubmit(onRegister)}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Full Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-invalid={Boolean(registrationErrors.name)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...registerAccount("name", {
                    required: "Name is required",
                    maxLength: {
                      value: 100,
                      message: "Name must be 100 characters or fewer",
                    },
                  })}
                />
                {registrationErrors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {registrationErrors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email Address
                </label>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  aria-invalid={Boolean(registrationErrors.email)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...registerAccount("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {registrationErrors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {registrationErrors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(registrationErrors.password)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...registerAccount("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                />
                {registrationErrors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {registrationErrors.password.message}
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show password
              </label>

              {serverError && (
                <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isRegisteringAccount}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRegisteringAccount ? "Creating account..." : "Create Account"}
              </button>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setServerError("");
                    setFormMessage("");
                  }}
                  className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400"
                >
                  Sign in
                </button>
              </p>
            </form>
            ) : (
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
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
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
                <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={Boolean(errors.password)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-20 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 my-auto h-10 px-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={showForgotPasswordHelp}
                  className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400"
                >
                  Forgot Password?
                </button>
              </div>

              {serverError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  {serverError}
                </p>
              )}

              {formMessage && (
                <p
                  role="status"
                  className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                >
                  {formMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                New to SupportDesk?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true);
                    setServerError("");
                    setFormMessage("");
                  }}
                  className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400"
                >
                  Create account
                </button>
              </p>
            </form>
            )}

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
