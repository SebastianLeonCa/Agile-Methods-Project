import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileForm from "@/components/ProfileForm";
import { Card } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My profile · CleanUp Map" };

export default function ProfilePage() {
  return (
    <Card title="My profile" subtitle="How neighbors see you, and where you call home." icon={<UserRound className="size-5" aria-hidden />} wide>
      <Suspense fallback={<p className="text-sm text-muted">Loading your profile…</p>}>
        <ProfileLoader />
      </Suspense>
    </Card>
  );
}

async function ProfileLoader() {
  // src/proxy.ts already redirects logged-out users; this is a second guard.
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/profile");
  return <ProfileForm profile={profile} />;
}
