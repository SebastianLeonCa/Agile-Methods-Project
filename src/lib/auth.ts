import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** The logged-in user's profile, or null when logged out. Call inside <Suspense> (reads cookies). */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return profile as Profile | null;
}
