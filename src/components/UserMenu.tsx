import Link from "next/link";
import { logOut } from "@/app/auth/actions";
import Avatar from "@/components/Avatar";
import { getCurrentProfile } from "@/lib/auth";

/** Header right side: Log in / Sign up, or avatar + Log out. Reads cookies, so render inside <Suspense>. */
export default async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <nav className="flex shrink-0 items-center gap-2 text-sm font-medium">
        <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-emerald-800">
          Log in
        </Link>
        <Link href="/signup" className="rounded-lg bg-white px-3 py-2 text-emerald-800 hover:bg-emerald-50">
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex shrink-0 items-center gap-2 text-sm font-medium">
      <Link href="/profile" aria-label={`My profile (${profile.username})`} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-emerald-800 sm:px-2">
        <Avatar profile={profile} />
        <span className="hidden sm:inline">{profile.username}</span>
      </Link>
      <form action={logOut}>
        <button type="submit" className="rounded-lg px-3 py-2 hover:bg-emerald-800">
          Log out
        </button>
      </form>
    </nav>
  );
}
