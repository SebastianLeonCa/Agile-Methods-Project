// TypeScript types matching the database (supabase/migrations).

export const SPOT_TYPES = ["park", "beach", "street", "river", "other"] as const;
export const URGENCIES = ["low", "medium", "high"] as const;
export const SPOT_STATUSES = ["dirty", "planned", "clean"] as const;

export type SpotType = (typeof SPOT_TYPES)[number];
export type Urgency = (typeof URGENCIES)[number];
export type SpotStatus = (typeof SPOT_STATUSES)[number];

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

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  home_area: string | null;
  home_lat: number | null;
  home_lng: number | null;
  created_at: string;
};

/** A spot as loaded for the map: with the ids of users who confirmed it is still dirty. */
export type MapSpot = Spot & { spot_confirmations: { user_id: string }[] };
