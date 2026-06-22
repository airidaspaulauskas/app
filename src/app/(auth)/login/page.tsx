import Link from "next/link";

import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_NAME } from "@/config/app";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link
        href="/"
        className="font-serif text-2xl font-semibold tracking-tight"
      >
        {APP_NAME}
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in or create an account</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a magic link — no password
            required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="max-w-sm text-center text-xs text-muted-foreground">
        By continuing you agree to our terms and privacy policy.
      </p>
    </div>
  );
}
