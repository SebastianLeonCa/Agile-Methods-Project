import { Suspense } from "react";
import SpotExplorer, { MapLoading } from "@/components/SpotExplorer";
import { createClient } from "@/lib/supabase/server";
import type { Spot } from "@/lib/types";

export default function Home() {
  return (
    <main className="relative h-full">
      {/* Spots are fetched fresh on every request. */}
      <Suspense fallback={<MapLoading />}>
        <Spots />
      </Suspense>
    </main>
  );
}

async function Spots() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("spots").select("*").order("created_at", { ascending: false });

  if (error) {
    return <p className="p-4 text-center text-red-700">Could not load litter spots. Please try again later.</p>;
  }
  return <SpotExplorer spots={data as Spot[]} />;
}
