import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileForm from "@/components/ProfileForm";
import { Card } from "@/components/ui";
import { getCurrentProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "My profile · CleanUp Map" };

export default function ProfilePage() {
  return (
    <Card title="My profile">
      <Suspense fallback={<p className="text-zinc-500">Loading your profile…</p>}>
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
