import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <span className="mx-auto font-serif text-xl font-semibold tracking-tight">
            {APP_NAME}
          </span>
          <CardTitle className="pt-2">Sign in</CardTitle>
          <CardDescription>
            Magic-link email sign-in arrives in Milestone 2.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <ArrowLeft />
              Back home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
