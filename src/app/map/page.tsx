import type { Metadata } from "next";
import { Suspense } from "react";
import SpotExplorer, { MapLoading } from "@/components/SpotExplorer";
import { createClient } from "@/lib/supabase/server";
import type { Spot } from "@/lib/types";

export const metadata: Metadata = { title: "Map · CleanUp Map" };

export default function MapPage() {
  return (
    <main className="relative h-full">
      {/* Spots and the login state are read fresh on every request. */}
      <Suspense fallback={<MapLoading />}>
        <MapData />
      </Suspense>
    </main>
  );
}

async function MapData() {
  const supabase = await createClient();
  const [{ data, error }, { data: auth }] = await Promise.all([
    supabase.from("spots").select("*").order("created_at", { ascending: false }),
    supabase.auth.getClaims(),
  ]);

  if (error) {
    return <p className="p-6 text-center text-red-700">Could not load litter spots. Please try again later.</p>;
  }
  return <SpotExplorer spots={data as Spot[]} isLoggedIn={!!auth?.claims} />;
}
