
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({
  label,
  error,
  id,
  className = "",
  required,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
        {required && (
          <span className="ml-1 text-rose-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus-visible:ring-blue-950 ${
          error
            ? "border-rose-500 focus-visible:ring-rose-100 dark:focus-visible:ring-rose-950"
            : "border-slate-300 dark:border-slate-700"
        } ${className}`}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-sm text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
