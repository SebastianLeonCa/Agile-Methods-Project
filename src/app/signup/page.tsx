import type { Metadata } from "next";
import SignupForm from "@/components/SignupForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Sign up · CleanUp Map" };

export default function SignupPage() {
  return (
    <Card title="Create your account">
      <SignupForm />
    </Card>
  );
}
