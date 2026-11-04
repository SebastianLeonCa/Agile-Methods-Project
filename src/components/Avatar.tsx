import type { Profile } from "@/lib/types";

/** Profile photo, or the username's first letter in a circle. */
export default function Avatar({ profile, size = 36 }: { profile: Pick<Profile, "username" | "avatar_url">; size?: number }) {
  const style = { width: size, height: size };
  if (profile.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatar_url} alt="" style={style} className="shrink-0 rounded-full object-cover" />;
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.42 }}
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-semibold text-brand-dark uppercase"
      aria-hidden
    >
      {profile.username[0]}
    </span>
  );
}
