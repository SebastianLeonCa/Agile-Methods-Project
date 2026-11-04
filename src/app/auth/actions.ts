"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";
import { type FieldErrors, validateSignup } from "@/lib/validation";

export type SignupState = {
  errors?: FieldErrors;
  message?: string;
  sentTo?: string;
  values?: { username: string; email: string };
};

export async function signUp(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const input = {
    username: String(formData.get("username") ?? "").trim().toLowerCase(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const values = { username: input.username, email: input.email };

  const errors = validateSignup(input);
  if (Object.keys(errors).length > 0) return { errors, values };

  // The confirmation email links back to this site (localhost or Vercel), so use the request's origin.
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm?next=/profile`,
      data: { username: input.username },
    },
  });

  if (error) {
    const message =
      error.code === "over_email_send_rate_limit"
        ? "Too many sign-ups right now. Please try again in an hour."
        : error.code === "weak_password"
          ? "That password is too weak. Try a longer one."
          : "Could not sign up. Please try again.";
    return { message, values };
  }
  return { sentTo: input.email };
}

export type LoginState = { message?: string; email?: string };

export async function logIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""), "/");

  if (!email || !password) return { message: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "Please confirm your email first. Check your inbox for the link."
        : error.code === "invalid_credentials"
          ? "Wrong email or password."
          : "Could not log in. Please try again.";
    return { message, email };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
