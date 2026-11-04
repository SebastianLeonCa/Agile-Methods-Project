import { LogIn } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { Alert, Card } from "@/components/ui";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Log in · CleanUp Map" };

const MESSAGES: Record<string, { kind: "error" | "success"; text: string }> = {
  confirmed: { kind: "success", text: "Your email is confirmed. Log in to continue." },
  link: { kind: "error", text: "That confirmation link is invalid or has expired. Try logging in, or sign up again." },
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Card title="Log in" subtitle="Welcome back! Let's keep your neighborhood clean." icon={<LogIn className="size-5" aria-hidden />}>
      {/* searchParams are only known at request time. */}
      <Suspense>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </Card>
  );
}

async function LoginContent({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const get = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const notice = MESSAGES[get("message") ?? get("error") ?? ""];

  return (
    <div className="space-y-5">
      {notice && <Alert kind={notice.kind}>{notice.text}</Alert>}
      <LoginForm next={safeNextPath(get("next"))} />
    </div>
  );
}
