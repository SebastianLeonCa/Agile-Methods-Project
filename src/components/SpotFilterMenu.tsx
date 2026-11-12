"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SPOT_STATUSES, SPOT_TYPES, URGENCIES } from "@/lib/types";
import { cn, NO_FILTERS, type SpotFilters, STATUS_LABEL, TYPE_LABEL } from "@/lib/utils";

const URGENCY_CHIP = {
  low: { label: "Low", dot: "bg-low" },
  medium: { label: "Medium", dot: "bg-medium" },
  high: { label: "High", dot: "bg-high" },
};

type Props = {
  filters: SpotFilters;
  onChange: (filters: SpotFilters) => void;
  shown: number;
  total: number;
};

/** Filter button for the map's top bar, with a dropdown of type / urgency / status chips. */
export default function SpotFilterMenu({ filters, onChange, shown, total }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const active = filters.types.length + filters.urgencies.length + filters.statuses.length;

  // Next keeps this page alive while hidden; don't bring back an open dropdown.
  useLayoutEffect(() => () => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  function toggle<K extends keyof SpotFilters>(group: K, value: SpotFilters[K][number]) {
    const list = filters[group] as string[];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    onChange({ ...filters, [group]: next });
  }

  return (
    // On phones the dropdown spans the whole top bar (the bar is the positioning parent), on desktop it hangs under the button.
    <div ref={root} className="pointer-events-auto sm:relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={active ? `Filters (${active} on)` : "Filters"}
        className={cn(
          "relative inline-flex size-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-white text-ink shadow-lg transition-colors duration-150 hover:bg-surface",
          active > 0 && "border-brand text-brand",
        )}
      >
        <SlidersHorizontal className="size-4.5" aria-hidden />
        {active > 0 && (
          <span className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
            {active}
          </span>
        )}
      </button>

      {open && (
        <div
          role="group"
          aria-label="Filter spots"
          className="animate-fade-in absolute inset-x-0 top-13 rounded-2xl border border-line bg-white p-4 shadow-xl sm:left-auto sm:w-80"
        >
          <Group label="Type">
            {SPOT_TYPES.map((t) => (
              <Chip key={t} on={filters.types.includes(t)} onClick={() => toggle("types", t)}>
                {TYPE_LABEL[t]}
              </Chip>
            ))}
          </Group>
          <Group label="Urgency">
            {URGENCIES.map((u) => (
              <Chip key={u} on={filters.urgencies.includes(u)} onClick={() => toggle("urgencies", u)}>
                <span className={cn("size-2.5 rounded-full", URGENCY_CHIP[u].dot)} aria-hidden />
                {URGENCY_CHIP[u].label}
              </Chip>
            ))}
          </Group>
          <Group label="Status">
            {SPOT_STATUSES.map((s) => (
              <Chip key={s} on={filters.statuses.includes(s)} onClick={() => toggle("statuses", s)}>
                {STATUS_LABEL[s]}
              </Chip>
            ))}
          </Group>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
            <span className="text-muted" role="status">
              Showing {shown} of {total} spots
            </span>
            <button
              type="button"
              onClick={() => onChange(NO_FILTERS)}
              disabled={active === 0}
              className="font-medium text-brand hover:text-brand-dark disabled:text-muted"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-3 first:mt-0">
      <legend className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">{label}</legend>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150",
        on ? "border-brand bg-brand-soft text-green-900" : "border-line bg-white text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}
