import Link from "next/link";
import AvatarMenu from "@/components/AvatarMenu";
import { buttonClass, ghostButtonClass } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";

/** Header right side: Log in / Sign up, or the avatar menu. Reads cookies, so render inside <Suspense>. */
export default async function UserMenu() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link href="/login" className={`${ghostButtonClass} px-3`}>
          Log in
        </Link>
        <Link href="/signup" className={`${buttonClass} px-3`}>
          Sign up
        </Link>
      </div>
    );
  }
  return <AvatarMenu username={profile.username} avatarUrl={profile.avatar_url} />;
}
