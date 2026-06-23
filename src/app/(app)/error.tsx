"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-serif text-2xl font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. Try again — if it keeps happening, refresh
          the page.
        </p>
      </div>
      <Button variant="brand" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
