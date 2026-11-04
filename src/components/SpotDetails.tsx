"use client";

import { Calendar, MapPin, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui";
import type { Spot, SpotStatus, Urgency } from "@/lib/types";
import { cn, formatDate, STATUS_LABEL, TYPE_LABEL, URGENCY_LABEL } from "@/lib/utils";

const URGENCY_BADGE: Record<Urgency, { dot: string; badge: string }> = {
  low: { dot: "bg-low", badge: "bg-green-50 text-green-800" },
  medium: { dot: "bg-medium", badge: "bg-amber-50 text-amber-800" },
  high: { dot: "bg-high", badge: "bg-red-50 text-red-700" },
};

const STATUS_BADGE: Record<SpotStatus, string> = {
  dirty: "bg-slate-100 text-slate-700",
  planned: "bg-brand-soft text-green-800",
  clean: "bg-blue-50 text-blue-700",
};

const CLOSE_DRAG = 80; // px dragged down on the handle to close the mobile sheet

type Props = {
  spot: Spot;
  onClose: () => void;
};

/** Floating card on desktop (slides in from the right), bottom sheet with a drag handle on mobile. */
export default function SpotDetails({ spot, onClose }: Props) {
  const [drag, setDrag] = useState<{ startY: number; dy: number } | null>(null);

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag({ startY: e.clientY, dy: 0 });
    },
    onPointerMove: (e: React.PointerEvent) => drag && setDrag({ ...drag, dy: Math.max(0, e.clientY - drag.startY) }),
    onPointerUp: () => {
      if (drag && drag.dy > CLOSE_DRAG) onClose();
      setDrag(null);
    },
  };

  return (
    <aside
      aria-label="Spot details"
      style={drag ? { transform: `translateY(${drag.dy}px)`, transition: "none" } : undefined}
      className={cn(
        "absolute inset-x-0 bottom-0 z-[1000] flex max-h-[60%] flex-col overflow-hidden rounded-t-3xl border border-line bg-white shadow-2xl",
        "animate-sheet-up sm:animate-slide-in sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:max-h-[calc(100%-6rem)] sm:w-[380px] sm:rounded-2xl",
      )}
    >
      {/* Drag handle (mobile only). */}
      <div {...handlers} className="flex shrink-0 cursor-grab touch-none justify-center py-2.5 sm:hidden" aria-hidden>
        <span className="h-1.5 w-10 rounded-full bg-slate-300" />
      </div>

      <div className="min-h-0 overflow-y-auto px-4 pb-6 sm:pt-4">
        <div className="relative">
          {spot.before_photo_url && (
            <div className={cn("grid gap-2", spot.after_photo_url && "grid-cols-2")}>
              <Photo src={spot.before_photo_url} label={spot.after_photo_url ? "Before" : undefined} title={spot.title} />
              {spot.after_photo_url && <Photo src={spot.after_photo_url} label="After" title={spot.title} />}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-colors duration-150 hover:bg-surface",
              spot.before_photo_url ? "absolute top-2 right-2" : "float-right",
            )}
          >
            <X className="size-4.5" aria-hidden />
          </button>
        </div>

        <h2 className="mt-4 text-lg leading-snug font-bold tracking-tight">{spot.title}</h2>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className="bg-slate-100 text-slate-700">{TYPE_LABEL[spot.type]}</Badge>
          <Badge className={URGENCY_BADGE[spot.urgency].badge}>
            <span className={cn("size-2 rounded-full", URGENCY_BADGE[spot.urgency].dot)} aria-hidden />
            {URGENCY_LABEL[spot.urgency]}
          </Badge>
          <Badge className={STATUS_BADGE[spot.status]}>{STATUS_LABEL[spot.status]}</Badge>
        </div>

        {spot.description && <p className="mt-4 text-sm leading-relaxed text-slate-700">{spot.description}</p>}

        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-muted">
          {spot.address && (
            <div className="flex gap-2">
              <dt>
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-label="Address" />
              </dt>
              <dd>{spot.address}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt>
              <Calendar className="mt-0.5 size-4 shrink-0 text-brand" aria-label="Reported" />
            </dt>
            <dd>Reported {formatDate(spot.created_at)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}

function Photo({ src, label, title }: { src: string; label?: string; title: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl bg-slate-100">
      {/* Plain <img>: photos come from external hosts and we skip Vercel image optimization limits. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label ? `${label} photo of ${title}` : `Photo of ${title}`}
        className="aspect-[16/10] w-full object-cover"
      />
      {label && (
        <figcaption className="absolute bottom-2 left-2 rounded-full bg-ink/70 px-2 py-0.5 text-xs font-medium text-white">
          {label}
        </figcaption>
      )}
    </figure>
  );
}
