import type { Profile } from "@/lib/types";

/** Profile photo, or the username's first letter in a circle. */
export default function Avatar({ profile, size = 36 }: { profile: Pick<Profile, "username" | "avatar_url">; size?: number }) {
  const style = { width: size, height: size };
  if (profile.avatar_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={profile.avatar_url} alt="" style={style} className="rounded-full object-cover ring-2 ring-white" />;
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.45 }}
      className="inline-flex items-center justify-center rounded-full bg-emerald-200 font-bold text-emerald-900 uppercase ring-2 ring-white"
    >
      {profile.username[0]}
    </span>
  );
}
