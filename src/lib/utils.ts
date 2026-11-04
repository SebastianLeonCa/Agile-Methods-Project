import type { Spot, SpotStatus, SpotType, Urgency } from "@/lib/types";

const URGENCY_ICON: Record<Urgency, string> = { low: "🟢", medium: "🟡", high: "🔴" };

/** Map pin emoji: clean spots show ✅, others show their urgency color. */
export function spotIcon(spot: Pick<Spot, "urgency" | "status">): string {
  return spot.status === "clean" ? "✅" : URGENCY_ICON[spot.urgency];
}

export const TYPE_LABEL: Record<SpotType, string> = {
  park: "Park",
  beach: "Beach",
  street: "Street",
  river: "River",
  other: "Other",
};

export const URGENCY_LABEL: Record<Urgency, string> = {
  low: "Low urgency",
  medium: "Medium urgency",
  high: "High urgency",
};

export const STATUS_LABEL: Record<SpotStatus, string> = {
  dirty: "Needs cleanup",
  planned: "Cleanup planned",
  clean: "Clean",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
}
