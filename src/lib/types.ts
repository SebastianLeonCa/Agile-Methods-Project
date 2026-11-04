// TypeScript types matching the database (supabase/migrations).

export type SpotType = "park" | "beach" | "street" | "river" | "other";
export type Urgency = "low" | "medium" | "high";
export type SpotStatus = "dirty" | "planned" | "clean";

export type Spot = {
  id: string;
  created_by: string | null;
  title: string;
  description: string | null;
  type: SpotType;
  urgency: Urgency;
  status: SpotStatus;
  lat: number;
  lng: number;
  address: string | null;
  before_photo_url: string | null;
  after_photo_url: string | null;
  dangerous_waste: boolean;
  created_at: string;
  updated_at: string;
};
