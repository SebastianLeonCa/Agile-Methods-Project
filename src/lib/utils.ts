import type { Spot, SpotStatus, SpotType, Urgency } from "@/lib/types";

export type PinVariant = Urgency | "clean";

/** Pin color: clean spots are "clean" (blue + check), others use their urgency color. */
export function pinVariant(spot: Pick<Spot, "urgency" | "status">): PinVariant {
  return spot.status === "clean" ? "clean" : spot.urgency;
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

/** Map filters: an empty list means "show all" for that group. */
export type SpotFilters = { types: SpotType[]; urgencies: Urgency[]; statuses: SpotStatus[] };

export const NO_FILTERS: SpotFilters = { types: [], urgencies: [], statuses: [] };

export function filterSpots<T extends Pick<Spot, "type" | "urgency" | "status">>(spots: T[], filters: SpotFilters): T[] {
  const allows = <V>(chosen: V[], value: V) => chosen.length === 0 || chosen.includes(value);
  return spots.filter(
    (s) => allows(filters.types, s.type) && allows(filters.urgencies, s.urgency) && allows(filters.statuses, s.status),
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" });
}

/** Pages that need a logged-in user (checked in src/proxy.ts). */
const PROTECTED_PATHS = ["/profile", "/dashboard", "/spots/new", "/events/new"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) || pathname.endsWith("/edit");
}

/** Where users land after logging in or confirming their email. */
export const HOME_AFTER_LOGIN = "/map";

/** Only allow redirects to paths on this site (blocks "//evil.com" and absolute URLs). */
export function safeNextPath(next: string | null | undefined, fallback = HOME_AFTER_LOGIN): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
