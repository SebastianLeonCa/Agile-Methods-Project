import type { Spot } from "@/lib/types";

export function makeSpot(overrides: Partial<Spot> = {}): Spot {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    created_by: null,
    title: "Plastic around Panther Hollow Lake",
    description: "Bottles and plastic bags along the edge of the lake.",
    type: "park",
    urgency: "high",
    status: "dirty",
    lat: 40.4357,
    lng: -79.9462,
    address: "Panther Hollow Lake, Schenley Park, Pittsburgh, PA 15213",
    before_photo_url: "https://picsum.photos/seed/cleanup-1/800/600",
    after_photo_url: null,
    dangerous_waste: false,
    created_at: "2026-11-01T15:00:00Z",
    updated_at: "2026-11-01T15:00:00Z",
    ...overrides,
  };
}
