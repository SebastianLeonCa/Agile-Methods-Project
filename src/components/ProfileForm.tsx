"use client";

import dynamic from "next/dynamic";
import { useActionState, useState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";
import Avatar from "@/components/Avatar";
import type { LatLng } from "@/components/LocationPicker";
import { Alert, buttonClass, Field, inputClass } from "@/components/ui";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { USERNAME_HINT } from "@/lib/validation";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-56 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />,
});

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  const errors = state.errors ?? {};

  const [username, setUsername] = useState(profile.username);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [home, setHome] = useState<LatLng | null>(
    profile.home_lat !== null && profile.home_lng !== null ? { lat: profile.home_lat, lng: profile.home_lng } : null,
  );

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const blob = await compressImage(file, 512);
      const path = `${profile.id}/avatar-${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("spot-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      setAvatarUrl(supabase.storage.from("spot-photos").getPublicUrl(path).data.publicUrl);
    } catch {
      setUploadError("Could not upload that photo. Try a JPEG or PNG image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.message && <Alert kind="error">{state.message}</Alert>}
      {state.saved && !pending && <Alert kind="success">Profile saved ✓</Alert>}

      <div className="flex items-center gap-4">
        <Avatar profile={{ username: username || profile.username, avatar_url: avatarUrl || null }} size={72} />
        <div className="space-y-1">
          <label className={`${buttonClass} cursor-pointer`}>
            {uploading ? "Uploading…" : "Change photo"}
            <input type="file" accept="image/*" onChange={onPhotoChange} disabled={uploading} className="sr-only" />
          </label>
          {avatarUrl && (
            <button type="button" onClick={() => setAvatarUrl("")} className="block text-sm text-zinc-500 underline">
              Remove photo
            </button>
          )}
          {(uploadError || errors.avatar) && <p className="text-sm text-red-700">{uploadError || errors.avatar}</p>}
        </div>
      </div>
      <input type="hidden" name="avatarUrl" value={avatarUrl} />

      <Field label="Username" name="username" error={errors.username} hint={USERNAME_HINT}>
        <input id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)}
          aria-invalid={!!errors.username} className={inputClass} />
      </Field>

      <Field label="Home area" name="homeArea" error={errors.homeArea} hint="e.g. Oakland, Squirrel Hill, Shadyside">
        <input id="homeArea" name="homeArea" defaultValue={profile.home_area ?? ""} maxLength={100} className={inputClass} />
      </Field>

      <div className="space-y-1">
        <p className="text-sm font-medium">Home location</p>
        <p className="text-xs text-zinc-500">
          Tap the map to place your home pin; drag it to adjust. Used to show cleanups near you.
        </p>
        <LocationPicker value={home} onChange={setHome} />
        <input type="hidden" name="homeLat" value={home?.lat ?? ""} />
        <input type="hidden" name="homeLng" value={home?.lng ?? ""} />
        {home && (
          <button type="button" onClick={() => setHome(null)} className="text-sm text-zinc-500 underline">
            Clear home location
          </button>
        )}
        {errors.home && <p className="text-sm text-red-700">{errors.home}</p>}
      </div>

      <button type="submit" disabled={pending || uploading} className={`${buttonClass} w-full sm:w-auto`}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
