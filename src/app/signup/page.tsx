import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "@/components/SignupForm";
import { Card } from "@/components/ui";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign up · CleanUp Map" };

export default function SignupPage({ searchParams }: PageProps<"/signup">) {
  return (
    <Card title="Create your account" subtitle="Free forever. Start mapping and cleaning today." icon={<UserPlus className="size-5" aria-hidden />}>
      {/* searchParams are only known at request time. */}
      <Suspense>
        <SignupContent searchParams={searchParams} />
      </Suspense>
    </Card>
  );
}

async function SignupContent({ searchParams }: Pick<PageProps<"/signup">, "searchParams">) {
  const { next } = await searchParams;
  return <SignupForm next={safeNextPath(typeof next === "string" ? next : undefined)} />;
}
