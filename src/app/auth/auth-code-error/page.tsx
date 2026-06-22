import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Sign-in link problem" };

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <CardTitle className="pt-2">That link didn&apos;t work</CardTitle>
          <CardDescription>
            Your sign-in link may have expired or already been used. Request a
            fresh one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="brand" className="w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
