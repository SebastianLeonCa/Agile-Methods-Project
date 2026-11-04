"use client";

import Link from "next/link";
import { useActionState } from "react";
import { logIn, type LoginState } from "@/app/auth/actions";
import { Alert, buttonClass, Field, inputClass } from "@/components/ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(logIn, {});

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && <Alert kind="error">{state.message}</Alert>}
      <input type="hidden" name="next" value={next} />

      <Field label="Email" name="email">
        <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
          defaultValue={state.email} className={inputClass} />
      </Field>
      <Field label="Password" name="password">
        <input id="password" name="password" type="password" autoComplete="current-password" className={inputClass} />
      </Field>

      <button type="submit" disabled={pending} className={`${buttonClass} w-full py-3`}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-dark hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
