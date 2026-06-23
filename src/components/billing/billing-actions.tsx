"use client";

import * as React from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { PlanTier } from "@/config/app";
import { Button } from "@/components/ui/button";

type Action = "checkout" | "portal";

export function BillingActions({
  planTier,
  disabled,
}: {
  planTier: PlanTier;
  disabled?: boolean;
}) {
  const [loading, setLoading] = React.useState<Action | null>(null);

  async function go(endpoint: string, action: Action) {
    setLoading(action);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data: { url?: string; error?: string } = await response.json();
      if (!response.ok || !data.url) {
        toast.error(data.error ?? "Something went wrong.");
        setLoading(null);
        return;
      }
      // External redirect to Stripe-hosted Checkout / Portal.
      window.location.href = data.url;
    } catch {
      toast.error("Network error. Try again.");
      setLoading(null);
    }
  }

  if (planTier === "pro") {
    return (
      <Button
        variant="outline"
        onClick={() => go("/api/stripe/portal", "portal")}
        disabled={disabled || loading !== null}
      >
        {loading === "portal" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <CreditCard />
        )}
        Manage billing
      </Button>
    );
  }

  return (
    <Button
      variant="brand"
      onClick={() => go("/api/stripe/checkout", "checkout")}
      disabled={disabled || loading !== null}
    >
      {loading === "checkout" ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles />
      )}
      Upgrade to Pro
    </Button>
  );
}
