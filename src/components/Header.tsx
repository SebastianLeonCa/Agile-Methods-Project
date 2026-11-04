import Link from "next/link";
import { Suspense } from "react";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 bg-emerald-700 px-4 py-3 text-white sm:px-6">
      <Link href="/" className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">CleanUp Map</h1>
        <p className="text-xs text-emerald-100 sm:text-sm">See it. Map it. Clean it. Together.</p>
      </Link>
      {/* The user menu reads the session cookie, so it streams in after the static header. */}
      <Suspense fallback={<div className="h-9 w-24" />}>
        <UserMenu />
      </Suspense>
    </header>
  );
}
