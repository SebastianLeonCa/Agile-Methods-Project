import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/**
 * Landing page for the "Confirm your email" link.
 * - Default Supabase email: Supabase confirms the email, then redirects here with `?code=` (PKCE).
 *   The code can only be exchanged in the browser that signed up; elsewhere we ask the user to log in.
 * - Custom email template: `?token_hash=&type=` works in any browser.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), "/profile");
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url));

  // Expired or already-used link: Supabase sends us an error instead of a code.
  if (searchParams.get("error")) return go("/login?error=link");

  const supabase = await createClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    // Supabase only issues a code after confirming the email, so a failed exchange still means "confirmed".
    return go(error ? "/login?message=confirmed" : next);
  }
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return go(next);
  }
  return go("/login?error=link");
}
