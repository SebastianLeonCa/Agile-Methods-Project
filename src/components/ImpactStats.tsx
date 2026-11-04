import { createClient } from "@/lib/supabase/server";

/** Live numbers from the spots table. Async server component: render inside <Suspense>. */
export default async function ImpactStats() {
  const supabase = await createClient();
  const [reported, cleaned] = await Promise.all([
    supabase.from("spots").select("id", { count: "exact", head: true }),
    supabase.from("spots").select("id", { count: "exact", head: true }).eq("status", "clean"),
  ]);
  const total = reported.count ?? 0;
  const clean = cleaned.count ?? 0;

  return (
    <StatsGrid
      stats={[
        { label: "Spots reported", value: String(total) },
        { label: "Spots cleaned", value: String(clean) },
        { label: "Cleaned so far", value: total ? `${Math.round((clean / total) * 100)}%` : "0%" },
      ]}
    />
  );
}

export function StatsGrid({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
          <dd className="font-display text-4xl font-bold tracking-tight text-brand">{s.value}</dd>
          <dt className="mt-1 text-sm font-medium text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function ImpactStatsSkeleton() {
  return <StatsGrid stats={["Spots reported", "Spots cleaned", "Cleaned so far"].map((label) => ({ label, value: "–" }))} />;
}
