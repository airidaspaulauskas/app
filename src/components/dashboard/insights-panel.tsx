"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { InsightCard, InsightsPayload } from "@/lib/ai/types";
import { formatCents } from "@/lib/subscriptions/format";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/config/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const KIND_LABEL: Record<InsightCard["kind"], string> = {
  overlap: "Overlap",
  unused: "Likely unused",
  cut: "Cut first",
};

const KIND_VARIANT: Record<
  InsightCard["kind"],
  React.ComponentProps<typeof Badge>["variant"]
> = {
  overlap: "warning",
  unused: "secondary",
  cut: "destructive",
};

const DISMISSED_KEY = "subwise:insights:dismissed";
const ACTIONED_KEY = "subwise:insights:actioned";

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

export function InsightsPanel({
  planTier,
  initialPayload,
  subscriptionCount,
}: {
  planTier: PlanTier;
  initialPayload: InsightsPayload | null;
  subscriptionCount: number;
}) {
  const [payload, setPayload] = React.useState<InsightsPayload | null>(
    initialPayload,
  );
  const [loading, setLoading] = React.useState(false);
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const [actioned, setActioned] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setDismissed(readSet(DISMISSED_KEY));
    setActioned(readSet(ACTIONED_KEY));
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev).add(id);
      writeSet(DISMISSED_KEY, next);
      return next;
    });
  }

  function toggleActioned(id: string) {
    setActioned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeSet(ACTIONED_KEY, next);
      return next;
    });
  }

  async function generate() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/insights", { method: "POST" });
      const data: { payload?: InsightsPayload; error?: string } =
        await response.json();
      if (!response.ok || !data.payload) {
        toast.error(data.error ?? "Couldn't generate insights.");
        return;
      }
      setPayload(data.payload);
      toast.success("Insights updated.");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // Free tier: locked upsell.
  if (planTier !== "pro") {
    return (
      <Card className="border-brand/30 bg-brand/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            AI insights
          </CardTitle>
          <CardDescription>
            Spot overlapping tools, flag the ones you&apos;ve forgotten, and get
            a ranked list of what to cancel — with the savings quantified.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            AI insights are part of <span className="font-medium">Pro</span>.
          </p>
          <Button asChild variant="brand">
            <Link href="/billing">
              <Lock />
              Unlock with Pro
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const visibleCards = (payload?.cards ?? []).filter(
    (card) => !dismissed.has(card.id),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            AI insights
          </CardTitle>
          <CardDescription>
            {payload
              ? `Updated ${formatDistanceToNow(new Date(payload.generatedAt), {
                  addSuffix: true,
                })}`
              : "Find overlapping and unused subscriptions."}
          </CardDescription>
        </div>
        <Button
          onClick={generate}
          disabled={loading || subscriptionCount < 2}
          variant="outline"
          size="sm"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RefreshCw />
          )}
          {payload ? "Refresh" : "Generate"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscriptionCount < 2 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Add at least 2 subscriptions and we&apos;ll find what to cut.
          </p>
        ) : !payload ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <TrendingDown className="h-6 w-6 text-brand" />
            <p className="max-w-sm text-sm text-muted-foreground">
              Generate your first savings recommendation — we&apos;ll analyze
              your subscriptions for overlap and unused tools.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-success/10 p-4">
              <span className="font-serif text-3xl font-semibold tabular-nums text-success">
                {formatCents(payload.totalPotentialMonthlySavingsCents)}/mo
              </span>
              <span className="text-sm text-muted-foreground">
                {payload.headline}
              </span>
            </div>

            {visibleCards.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No insights to show — refresh to analyze again.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {visibleCards.map((card) => {
                  const isActioned = actioned.has(card.id);
                  return (
                    <li
                      key={card.id}
                      className={cn(
                        "flex flex-col rounded-lg border p-4 transition-opacity",
                        isActioned && "opacity-60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={KIND_VARIANT[card.kind]}>
                          {KIND_LABEL[card.kind]}
                        </Badge>
                        <span className="font-medium tabular-nums text-success">
                          {formatCents(card.monthlySavingsCents)}/mo
                        </span>
                      </div>
                      <h3
                        className={cn(
                          "mt-2 font-medium",
                          isActioned && "line-through",
                        )}
                      >
                        {card.headline}
                      </h3>
                      <p className="mt-1 flex-1 text-sm text-muted-foreground">
                        {card.reason}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={isActioned ? "secondary" : "outline"}
                          onClick={() => toggleActioned(card.id)}
                        >
                          {isActioned ? <Undo2 /> : <Check />}
                          {isActioned ? "Undo" : "Mark actioned"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => dismiss(card.id)}
                          aria-label="Dismiss insight"
                        >
                          <X />
                          Dismiss
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
