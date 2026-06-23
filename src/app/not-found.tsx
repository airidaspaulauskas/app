import Link from "next/link";

import { APP_NAME } from "@/config/app";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-serif text-6xl font-semibold tracking-tight">404</p>
      <p className="max-w-sm text-muted-foreground">
        We couldn&apos;t find that page.
      </p>
      <Button asChild variant="brand">
        <Link href="/">Back to {APP_NAME}</Link>
      </Button>
    </div>
  );
}
