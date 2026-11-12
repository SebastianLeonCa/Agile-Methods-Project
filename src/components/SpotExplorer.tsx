"use client";

import { Check, MapPin, Plus, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, useTransition } from "react";
import { confirmSpot } from "@/app/map/actions";
import AuthPromptModal from "@/components/AuthPromptModal";
import type { LatLng } from "@/components/LocationPicker";
import ReportSpotForm from "@/components/ReportSpotForm";
import SpotDetails from "@/components/SpotDetails";
import SpotFilterMenu from "@/components/SpotFilterMenu";
import { buttonClass } from "@/components/ui";
import { useShownOnly } from "@/components/useShownOnly";
import type { MapSpot } from "@/lib/types";
import { cn, filterSpots, NO_FILTERS, type SpotFilters } from "@/lib/utils";

// Leaflet needs `window`, so the map only renders in the browser.
const LitterMap = dynamic(() => import("@/components/LitterMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export function MapLoading() {
  return (
    <div className="flex h-full items-center justify-center bg-surface text-sm text-muted">
      <span className="animate-pulse">Loading map…</span>
    </div>
  );
}

/** The full-screen map with its floating top bar, filters, legend, details / report panel and login prompt. */
export default function SpotExplorer({ spots, userId }: { spots: MapSpot[]; userId: string | null }) {
  const shown = useShownOnly();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SpotFilters>(NO_FILTERS);
  // Report mode: null = off; pin null = waiting for the user to tap the map.
  const [report, setReport] = useState<{ pin: LatLng | null } | null>(null);
  const [authPrompt, setAuthPrompt] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [confirming, startConfirm] = useTransition();

  const visible = useMemo(() => filterSpots(spots, filters), [spots, filters]);
  // Looked up by id so it picks up fresh data (e.g. a new confirmation) after the server refreshes the page.
  const selected = visible.find((s) => s.id === selectedId) ?? null;

  // Next keeps this page alive while hidden; don't bring back a stale prompt, toast or half-filled report.
  useLayoutEffect(
    () => () => {
      setAuthPrompt(null);
      setToast("");
      setReport(null);
    },
    [],
  );

  // Escape closes the details panel or the "tap the map" step, but never throws away a half-filled report.
  useEffect(() => {
    if (!selected && !report) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || authPrompt) return;
      setSelectedId(null);
      if (report && !report.pin) setReport(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, report, authPrompt]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(null), []);
  const onReported = useCallback((spotId: string) => {
    setReport(null);
    setFilters(NO_FILTERS); // so the new spot is not hidden by a filter
    setSelectedId(spotId);
    setToast("Thanks! Your spot is on the map.");
  }, []);

  function onReport() {
    if (!userId) return setAuthPrompt("report a spot");
    setSelectedId(null);
    setReport({ pin: null });
  }

  function onConfirm(spotId: string) {
    if (!userId) return setAuthPrompt("confirm a spot");
    startConfirm(async () => {
      const { message } = await confirmSpot(spotId);
      if (message) setToast(message);
    });
  }

  return (
    <div className={cn("relative h-full w-full overflow-hidden", report && "reporting")}>
      {shown ? (
        <LitterMap
          spots={visible}
          selected={selected}
          onSelect={(spot) => !report && setSelectedId(spot?.id ?? null)}
          report={report ? { pin: report.pin, onPin: (pin) => setReport({ pin }) } : undefined}
        />
      ) : (
        <MapLoading />
      )}

      {/* Floating top bar */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex items-center gap-2 sm:inset-x-4 sm:top-4">
        <div className="pointer-events-auto flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-white px-3.5 shadow-lg sm:max-w-sm">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            disabled
            aria-label="Search places (coming soon)"
            placeholder="Search places…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed"
          />
          <span className="hidden rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted sm:inline">Soon</span>
        </div>
        <SpotFilterMenu filters={filters} onChange={setFilters} shown={visible.length} total={spots.length} />
        <button
          type="button"
          onClick={onReport}
          disabled={!!report}
          className={`${buttonClass} pointer-events-auto h-11 shrink-0 rounded-2xl shadow-lg sm:ml-auto`}
        >
          <Plus className="size-4.5" aria-hidden />
          <span className="max-[399px]:sr-only">Report a spot</span>
        </button>
      </div>

      {report && !report.pin && (
        <div
          role="status"
          className="animate-fade-in absolute inset-x-3 top-17 z-[1000] flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-lg sm:inset-x-auto sm:left-1/2 sm:top-20 sm:-translate-x-1/2"
        >
          <MapPin className="size-4.5 shrink-0 text-brand-soft" aria-hidden />
          <span className="flex-1">Tap the map where the litter is.</span>
          <button type="button" onClick={() => setReport(null)} className="font-semibold text-brand-soft hover:text-white">
            Cancel
          </button>
        </div>
      )}

      <Legend hidden={!!selected || !!report?.pin} />

      {selected && !report && (
        <SpotDetails
          key={selected.id}
          spot={selected}
          onClose={() => setSelectedId(null)}
          confirmations={{
            count: selected.spot_confirmations.length,
            mine: selected.spot_confirmations.some((c) => c.user_id === userId),
            pending: confirming,
            onConfirm: () => onConfirm(selected.id),
          }}
        />
      )}
      {report?.pin && userId && (
        <ReportSpotForm userId={userId} pin={report.pin} onCancel={() => setReport(null)} onReported={onReported} />
      )}
      {authPrompt && <AuthPromptModal action={authPrompt} next="/map" onClose={closeAuthPrompt} />}

      {toast && (
        <div
          role="status"
          className="animate-fade-in absolute bottom-6 left-1/2 z-[1100] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Legend({ hidden }: { hidden: boolean }) {
  const items = [
    { label: "Low", className: "bg-low" },
    { label: "Medium", className: "bg-medium" },
    { label: "High", className: "bg-high" },
    { label: "Clean", className: "bg-clean", check: true },
  ];
  return (
    <div
      aria-label="Map legend"
      role="group"
      className={`absolute bottom-6 left-3 z-[900] rounded-2xl border border-line bg-white/95 px-3.5 py-3 shadow-lg backdrop-blur transition-opacity duration-200 sm:left-4 ${
        hidden ? "pointer-events-none opacity-0 sm:pointer-events-auto sm:opacity-100" : "opacity-100"
      }`}
    >
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">Urgency</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-medium sm:grid-cols-1">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`inline-flex size-3.5 items-center justify-center rounded-full ring-2 ring-white ${item.className}`}>
              {item.check && <Check className="size-2.5 text-white" strokeWidth={4} aria-hidden />}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
