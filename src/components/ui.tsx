// Shared UI building blocks (buttons, form fields, cards). Colors come from the tokens in globals.css.
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-60";

export const buttonClass = cn(buttonBase, "bg-brand text-white shadow-sm hover:bg-brand-dark");
export const secondaryButtonClass = cn(buttonBase, "border border-line bg-white text-ink shadow-sm hover:bg-surface");
export const ghostButtonClass = cn(buttonBase, "text-ink hover:bg-surface");

export const inputClass =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base text-ink shadow-sm transition-shadow duration-150 placeholder:text-muted focus:border-brand focus:ring-4 focus:ring-brand/15 focus:outline-none aria-[invalid=true]:border-high";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const Icon = kind === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm",
        kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-brand-soft text-green-900",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

/** Centered page card used by login, sign-up and profile. */
export function Card({
  title,
  subtitle,
  icon,
  wide,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className={cn("mx-auto w-full px-4 py-8 sm:py-12", wide ? "max-w-2xl" : "max-w-md")}>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
        {icon && (
          <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">{icon}</div>
        )}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
