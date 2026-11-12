"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type FieldErrors, validateSpot } from "@/lib/validation";

export type ReportValues = { title: string; description: string; type: string; urgency: string };
export type ReportState = { errors?: FieldErrors; message?: string; spotId?: string; values?: ReportValues };

function toNumber(value: FormDataEntryValue | null): number | null {
  const n = value === null || value === "" ? NaN : Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function reportSpot(_prev: ReportState, formData: FormData): Promise<ReportState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { message: "Your session expired. Please log in again." };

  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const input = {
    title: text("title"),
    description: text("description"),
    type: text("type"),
    urgency: text("urgency"),
    lat: toNumber(formData.get("lat")),
    lng: toNumber(formData.get("lng")),
    address: text("address"),
    photoUrl: text("photoUrl"),
  };
  const photoFolder = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/spot-photos/${userId}/`;
  const values = { title: input.title, description: input.description, type: input.type, urgency: input.urgency };
  const errors = validateSpot(input, photoFolder);
  if (Object.keys(errors).length > 0) return { errors, values };

  const { data: spot, error } = await supabase
    .from("spots")
    .insert({
      created_by: userId,
      title: input.title,
      description: input.description || null,
      type: input.type,
      urgency: input.urgency,
      lat: input.lat,
      lng: input.lng,
      address: input.address || null,
      before_photo_url: input.photoUrl || null,
    })
    .select("id")
    .single();

  if (error || !spot) return { message: "Could not report the spot. Please try again.", values };

  // The map and the landing page's impact numbers.
  revalidatePath("/map");
  revalidatePath("/");
  return { spotId: spot.id };
}

/** "Still dirty": one confirmation per user (the table's primary key), so a repeat is not an error. */
export async function confirmSpot(spotId: string): Promise<{ message?: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return { message: "Please log in to confirm this spot." };

  const { error } = await supabase.from("spot_confirmations").insert({ spot_id: spotId, user_id: userId });
  if (error && error.code !== "23505") return { message: "Could not confirm the spot. Please try again." };

  revalidatePath("/map");
  return {};
}
