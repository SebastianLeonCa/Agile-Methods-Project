"use client";

import { Camera, LoaderCircle, MapPin, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { reportSpot, type ReportState } from "@/app/map/actions";
import type { LatLng } from "@/components/LocationPicker";
import { Alert, buttonClass, Field, inputClass, secondaryButtonClass } from "@/components/ui";
import { reverseGeocode } from "@/lib/geocode";
import { compressImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { SPOT_TYPES, URGENCIES, type Urgency } from "@/lib/types";
import { cn, TYPE_LABEL } from "@/lib/utils";

const GEOCODE_DELAY = 700; // ms after the pin stops moving (Nominatim allows 1 request/second)

const URGENCY_CHOICE: Record<Urgency, { label: string; dot: string }> = {
  low: { label: "Low", dot: "bg-low" },
  medium: { label: "Medium", dot: "bg-medium" },
  high: { label: "High", dot: "bg-high" },
};

const chipClass =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface has-checked:border-brand has-checked:bg-brand-soft has-checked:text-green-900 has-focus-visible:ring-4 has-focus-visible:ring-brand/20";

type Props = {
  userId: string;
  pin: LatLng;
  onCancel: () => void;
  onReported: (spotId: string) => void;
};

/** "Report a spot" panel, laid out like SpotDetails: card on the right (desktop), bottom sheet (mobile). */
export default function ReportSpotForm({ userId, pin, onCancel, onReported }: Props) {
  const [state, formAction, pending] = useActionState<ReportState, FormData>(reportSpot, {});
  const errors = state.errors ?? {};
  const values = state.values;

  const [address, setAddress] = useState("");
  const [addressEdited, setAddressEdited] = useState(false);
  const [locating, setLocating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (state.spotId) onReported(state.spotId);
  }, [state.spotId, onReported]);

  // Fill in the street address when the pin is placed or moved, until the user types their own.
  useEffect(() => {
    if (addressEdited) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLocating(true);
      try {
        setAddress(await reverseGeocode(pin.lat, pin.lng, controller.signal));
      } catch {
        // Offline or rate-limited: leave the field for the user to type.
      } finally {
        if (!controller.signal.aborted) setLocating(false);
      }
    }, GEOCODE_DELAY);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [pin.lat, pin.lng, addressEdited]);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const blob = await compressImage(file);
      const path = `${userId}/${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from("spot-photos").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      setPhotoUrl(supabase.storage.from("spot-photos").getPublicUrl(path).data.publicUrl);
    } catch {
      setUploadError("Could not upload that photo. Try a JPEG or PNG image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <aside
      aria-label="Report a spot"
      className={cn(
        "absolute inset-x-0 bottom-0 z-[1000] flex max-h-[60%] flex-col overflow-clip rounded-t-3xl border border-line bg-white shadow-2xl",
        "animate-sheet-up sm:animate-slide-in sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:max-h-[calc(100%-6rem)] sm:w-[380px] sm:rounded-2xl",
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="text-lg font-bold tracking-tight">Report a spot</h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel report"
          className="inline-flex size-9 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-surface"
        >
          <X className="size-4.5" aria-hidden />
        </button>
      </div>

      <form action={formAction} noValidate className="min-h-0 space-y-5 overflow-y-auto px-4 pt-4 pb-6">
        {state.message && <Alert kind="error">{state.message}</Alert>}
        <p className="flex items-start gap-2 text-xs text-muted">
          <MapPin className="mt-px size-3.5 shrink-0 text-brand" aria-hidden />
          Drag the green pin, or tap the map, to move it to the exact place.
        </p>
        <input type="hidden" name="lat" value={pin.lat} />
        <input type="hidden" name="lng" value={pin.lng} />
        {errors.location && <p className="text-sm text-red-700">{errors.location}</p>}

        <Field label="Title" name="title" error={errors.title} hint="e.g. Bottles along the river trail">
          <input id="title" name="title" defaultValue={values?.title} required maxLength={100} aria-invalid={!!errors.title} className={inputClass} />
        </Field>

        <Field label="Address" name="address" error={errors.address} hint={locating ? "Finding the address…" : "Filled in from the pin. You can edit it."}>
          <input
            id="address"
            name="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setAddressEdited(true);
            }}
            maxLength={200}
            aria-invalid={!!errors.address}
            className={inputClass}
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Type</legend>
          <div className="flex flex-wrap gap-2">
            {SPOT_TYPES.map((type) => (
              <label key={type} className={chipClass}>
                <input type="radio" name="type" value={type} defaultChecked={type === (values?.type ?? "other")} className="sr-only" />
                {TYPE_LABEL[type]}
              </label>
            ))}
          </div>
          {errors.type && <p className="text-sm text-red-700">{errors.type}</p>}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Urgency</legend>
          <div className="flex flex-wrap gap-2">
            {URGENCIES.map((urgency) => (
              <label key={urgency} className={chipClass}>
                <input type="radio" name="urgency" value={urgency} defaultChecked={urgency === (values?.urgency ?? "medium")} className="sr-only" />
                <span className={cn("size-2.5 rounded-full", URGENCY_CHOICE[urgency].dot)} aria-hidden />
                {URGENCY_CHOICE[urgency].label}
              </label>
            ))}
          </div>
          {errors.urgency && <p className="text-sm text-red-700">{errors.urgency}</p>}
        </fieldset>

        <Field label="Description (optional)" name="description" error={errors.description}>
          <textarea id="description" name="description" defaultValue={values?.description} rows={3} maxLength={1000} className={inputClass} />
        </Field>

        <div className="space-y-2">
          <p className="text-sm font-medium">&ldquo;Before&rdquo; photo (optional)</p>
          {photoUrl ? (
            <figure className="relative overflow-hidden rounded-xl bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="Before photo preview" className="aspect-[16/10] w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoUrl("")}
                className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium shadow-md hover:bg-surface"
              >
                <Trash2 className="size-3.5" aria-hidden /> Remove photo
              </button>
            </figure>
          ) : (
            <label className={`${secondaryButtonClass} w-full cursor-pointer focus-within:ring-4 focus-within:ring-brand/20`}>
              {uploading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Camera className="size-4" aria-hidden />}
              {uploading ? "Uploading…" : "Add a photo"}
              <input type="file" accept="image/*" onChange={onPhotoChange} disabled={uploading} aria-label="Before photo" className="sr-only" />
            </label>
          )}
          {(uploadError || errors.photo) && <p className="text-sm text-red-700">{uploadError || errors.photo}</p>}
          <input type="hidden" name="photoUrl" value={photoUrl} />
        </div>

        <div className="flex gap-2 border-t border-line pt-4">
          <button type="button" onClick={onCancel} className={`${secondaryButtonClass} flex-1`}>
            Cancel
          </button>
          <button type="submit" disabled={pending || uploading} className={`${buttonClass} flex-1`}>
            {pending ? "Reporting…" : "Report spot"}
          </button>
        </div>
      </form>
    </aside>
  );
}
