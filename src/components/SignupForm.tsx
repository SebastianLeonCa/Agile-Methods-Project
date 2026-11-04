"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignupState } from "@/app/auth/actions";
import { Alert, buttonClass, Field, inputClass } from "@/components/ui";
import { MIN_PASSWORD, USERNAME_HINT } from "@/lib/validation";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signUp, {});
  const errors = state.errors ?? {};

  if (state.sentTo) {
    return (
      <div className="space-y-4">
        <Alert kind="success">
          Check your email! We sent a confirmation link to <strong>{state.sentTo}</strong>.
        </Alert>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Open the link <strong>in this same browser</strong> to be logged in automatically. If you open it somewhere
          else, your email is still confirmed and you can just <Link href="/login" className="underline">log in</Link>.
        </p>
      </div>
    );
  }

  return (
    // noValidate: show our own messages instead of the browser's.
    <form action={formAction} noValidate className="space-y-4">
      {state.message && <Alert kind="error">{state.message}</Alert>}

      <Field label="Username" name="username" error={errors.username} hint={USERNAME_HINT}>
        <input id="username" name="username" autoComplete="username" defaultValue={state.values?.username}
          aria-invalid={!!errors.username} className={inputClass} />
      </Field>
      <Field label="Email" name="email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email}
          aria-invalid={!!errors.email} className={inputClass} />
      </Field>
      <Field label="Password" name="password" error={errors.password} hint={`At least ${MIN_PASSWORD} characters`}>
        <input id="password" name="password" type="password" autoComplete="new-password"
          aria-invalid={!!errors.password} className={inputClass} />
      </Field>
      <Field label="Confirm password" name="confirmPassword" error={errors.confirmPassword}>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword} className={inputClass} />
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "Signing up…" : "Sign up"}
      </button>
      <p className="text-center text-sm">
        Already have an account? <Link href="/login" className="font-medium text-emerald-700 underline">Log in</Link>
      </p>
    </form>
  );
}
