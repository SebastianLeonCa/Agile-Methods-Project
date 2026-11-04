"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { buttonClass, secondaryButtonClass } from "@/components/ui";

type Props = {
  /** What the visitor tried to do, e.g. "report a spot". */
  action: string;
  /** Where to come back to after logging in / signing up. */
  next: string;
  onClose: () => void;
};

/** Friendly "Log in to …" dialog shown when a visitor tries an action that needs an account. */
export default function AuthPromptModal({ action, next, onClose }: Props) {
  const firstLink = useRef<HTMLAnchorElement>(null);
  const query = `?next=${encodeURIComponent(next)}`;

  useEffect(() => {
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-[1200] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-up w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <LogIn className="size-6" aria-hidden />
        </div>
        <h2 id="auth-prompt-title" className="text-xl font-bold tracking-tight">
          Log in to {action}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Join CleanUp Map to report dirty spots, organize cleanups and track your impact. It&apos;s free.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link ref={firstLink} href={`/login${query}`} className={buttonClass}>
            Log in
          </Link>
          <Link href={`/signup${query}`} className={secondaryButtonClass}>
            Sign up
          </Link>
        </div>
        <button type="button" onClick={onClose} className="mt-3 w-full rounded-xl py-2 text-sm text-muted hover:text-ink">
          Not now
        </button>
      </div>
    </div>
  );
}
