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

/** Pages that need a logged-in user (checked in src/proxy.ts). */
const PROTECTED_PATHS = ["/profile", "/dashboard", "/spots/new", "/events/new"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname.endsWith("/edit");
}

/** Only allow redirects to paths on this site (blocks "//evil.com" and absolute URLs). */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
