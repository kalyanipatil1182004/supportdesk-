
import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "blue"
  | "indigo"
  | "amber"
  | "green"
  | "slate"
  | "rose";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
  indigo: "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  green: "bg-green-50 text-green-800 dark:bg-green-950/60 dark:text-green-300",
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  rose: "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
};

function Badge({
  variant = "blue",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
