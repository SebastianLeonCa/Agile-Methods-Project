import { Leaf } from "lucide-react";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex size-8 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
        <Leaf className="size-4.5" aria-hidden />
      </span>
      <span className="font-display text-base font-bold tracking-tight whitespace-nowrap text-ink sm:text-lg">CleanUp Map</span>
    </span>
  );
}
