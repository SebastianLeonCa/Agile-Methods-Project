"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { logOut } from "@/app/auth/actions";
import Avatar from "@/components/Avatar";

/** Avatar button with a small dropdown: Profile, Log out. */
export default function AvatarMenu({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when the page is hidden (Next keeps visited pages alive), on outside click and on Escape.
  useLayoutEffect(() => () => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu (${username})`}
        className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pr-2 pl-1 shadow-sm transition-colors duration-150 hover:bg-surface"
      >
        <Avatar profile={{ username, avatar_url: avatarUrl }} size={30} />
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{username}</span>
        <ChevronDown className={`size-4 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-lg"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">
            Signed in as <span className="font-medium text-ink">{username}</span>
          </p>
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface"
          >
            <User className="size-4 text-muted" aria-hidden /> Profile
          </Link>
          <form action={logOut}>
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-surface">
              <LogOut className="size-4 text-muted" aria-hidden /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
