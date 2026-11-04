"use client";

import { Check, Plus, Search, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import AuthPromptModal from "@/components/AuthPromptModal";
import SpotDetails from "@/components/SpotDetails";
import { buttonClass } from "@/components/ui";
import { useShownOnly } from "@/components/useShownOnly";
import type { Spot } from "@/lib/types";

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

/** The full-screen map with its floating top bar, legend, details panel and login prompt. */
export default function SpotExplorer({ spots, isLoggedIn }: { spots: Spot[]; isLoggedIn: boolean }) {
  const shown = useShownOnly();
  const [selected, setSelected] = useState<Spot | null>(null);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [toast, setToast] = useState("");

  // Next keeps this page alive while hidden; don't bring back a stale login prompt or toast.
  useLayoutEffect(
    () => () => {
      setAuthPrompt(false);
      setToast("");
    },
    [],
  );

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !authPrompt && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, authPrompt]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(false), []);

  function onReport() {
    if (!isLoggedIn) setAuthPrompt(true);
    else setToast("Reporting a spot is coming in the next update.");
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {shown ? (
        <LitterMap spots={spots} selected={selected} onSelect={setSelected} />
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
        <button
          type="button"
          disabled
          title="Filters are coming soon"
          aria-label="Filters (coming soon)"
          className="pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-muted shadow-lg disabled:cursor-not-allowed"
        >
          <SlidersHorizontal className="size-4.5" aria-hidden />
        </button>
        <button type="button" onClick={onReport} className={`${buttonClass} pointer-events-auto h-11 shrink-0 rounded-2xl shadow-lg sm:ml-auto`}>
          <Plus className="size-4.5" aria-hidden />
          <span className="max-[399px]:sr-only">Report a spot</span>
        </button>
      </div>

      <Legend hidden={!!selected} />

      {selected && <SpotDetails key={selected.id} spot={selected} onClose={() => setSelected(null)} />}
      {authPrompt && <AuthPromptModal action="report a spot" next="/map" onClose={closeAuthPrompt} />}

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
