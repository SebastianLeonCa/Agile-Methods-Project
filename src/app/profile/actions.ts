"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type FieldErrors, validateProfile } from "@/lib/validation";

export type ProfileState = { errors?: FieldErrors; message?: string; saved?: boolean };

function toNumber(value: FormDataEntryValue | null): number | null {
  const n = value === null || value === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { message: "Your session expired. Please log in again." };

  const input = {
    username: String(formData.get("username") ?? "").trim().toLowerCase(),
    homeArea: String(formData.get("homeArea") ?? "").trim(),
    homeLat: toNumber(formData.get("homeLat")),
    homeLng: toNumber(formData.get("homeLng")),
  };
  const avatarUrl = String(formData.get("avatarUrl") ?? "");

  const errors = validateProfile(input);
  // Only accept photos from this user's own folder in our bucket.
  const ownFolder = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/spot-photos/${userId}/`;
  if (avatarUrl && !avatarUrl.startsWith(ownFolder)) errors.avatar = "Invalid profile photo.";
  if (Object.keys(errors).length > 0) return { errors };

  const { error } = await supabase
    .from("profiles")
    .update({
      username: input.username,
      avatar_url: avatarUrl || null,
      home_area: input.homeArea || null,
      home_lat: input.homeLat,
      home_lng: input.homeLng,
    })
    .eq("id", userId);

  if (error) {
    if (error.code === "23505") return { errors: { username: "That username is taken. Try another one." } };
    return { message: "Could not save your profile. Please try again." };
  }

  revalidatePath("/", "layout");
  return { saved: true };
}
