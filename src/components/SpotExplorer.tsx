"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Spot } from "@/lib/types";
import SpotDetails from "@/components/SpotDetails";

// Leaflet needs `window`, so the map only renders in the browser.
const LitterMap = dynamic(() => import("@/components/LitterMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export function MapLoading() {
  return <div className="flex h-full items-center justify-center text-zinc-500">Loading map…</div>;
}

/** The map plus the details panel for the selected spot. */
export default function SpotExplorer({ spots }: { spots: Spot[] }) {
  const [selected, setSelected] = useState<Spot | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="relative h-full w-full">
      <LitterMap spots={spots} selectedId={selected?.id ?? null} onSelect={setSelected} />
      {selected && <SpotDetails spot={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
