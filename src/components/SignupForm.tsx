"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignupState } from "@/app/auth/actions";
import { Alert, buttonClass, Field, inputClass } from "@/components/ui";
import { MIN_PASSWORD, USERNAME_HINT } from "@/lib/validation";

export default function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signUp, {});
  const errors = state.errors ?? {};

  if (state.sentTo) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <MailCheck className="size-7" aria-hidden />
        </span>
        <h3 className="text-xl font-bold">Check your email!</h3>
        <p className="text-sm text-muted">
          We sent a confirmation link to <strong className="text-ink">{state.sentTo}</strong>.
        </p>
        <p className="rounded-xl bg-surface p-3 text-sm text-muted">
          Open the link <strong className="text-ink">in this same browser</strong> to be logged in automatically. Opened
          somewhere else, your email is still confirmed. Just{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
            log in
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    // noValidate: show our own messages instead of the browser's.
    <form action={formAction} noValidate className="space-y-5">
      {state.message && <Alert kind="error">{state.message}</Alert>}
      <input type="hidden" name="next" value={next} />

      <Field label="Username" name="username" error={errors.username} hint={USERNAME_HINT}>
        <input id="username" name="username" autoComplete="username" placeholder="e.g. panther_cleaner"
          defaultValue={state.values?.username} aria-invalid={!!errors.username} className={inputClass} />
      </Field>
      <Field label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
          defaultValue={state.values?.email} aria-invalid={!!errors.email} className={inputClass} />
      </Field>
      <Field label="Password" name="password" error={errors.password} hint={`At least ${MIN_PASSWORD} characters`}>
        <input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!errors.password} className={inputClass} />
      </Field>
      <Field label="Confirm password" name="confirmPassword" error={errors.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword} className={inputClass} />
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass} w-full py-3`}>
        {pending ? "Creating your account…" : "Sign up"}
      </button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
