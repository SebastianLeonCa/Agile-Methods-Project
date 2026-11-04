import { Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/Logo";
import UserMenu from "@/components/UserMenu";

export default function Header() {
  return (
    <header className="relative z-[1100] shrink-0 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-6">
          <Link href="/" aria-label="CleanUp Map home" className="rounded-xl">
            <Logo />
          </Link>
          <nav aria-label="Main">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
            >
              <MapIcon className="size-4" aria-hidden />
              <span className="sr-only sm:not-sr-only">Map</span>
            </Link>
          </nav>
        </div>
        {/* The user menu reads the session cookie, so it streams in after the static header. */}
        <Suspense fallback={<div className="h-9 w-28" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
