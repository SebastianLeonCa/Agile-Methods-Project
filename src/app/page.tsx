import { Suspense } from "react";
import Header from "@/components/Header";
import SpotExplorer, { MapLoading } from "@/components/SpotExplorer";
import { createClient } from "@/lib/supabase/server";
import type { Spot } from "@/lib/types";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="relative min-h-0 flex-1">
        {/* Spots are fetched fresh on every request; the header is static. */}
        <Suspense fallback={<MapLoading />}>
          <Spots />
        </Suspense>
      </main>
    </div>
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
