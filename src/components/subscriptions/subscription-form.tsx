"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  BILLING_CYCLES,
  LAST_USED_OPTIONS,
  SUBSCRIPTION_CATEGORIES,
  type BillingCycle,
  type LastUsedValue,
  type SubscriptionCategory,
} from "@/config/app";
import {
  createSubscription,
  updateSubscription,
} from "@/lib/subscriptions/actions";
import type { SubscriptionRow } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  name: string;
  category: SubscriptionCategory;
  cost: string;
  billingCycle: BillingCycle;
  renewalDate: string;
  lastUsed: LastUsedValue;
  notes: string;
};

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  annual: "Annual",
};

const BLANK: FormState = {
  name: "",
  category: "AI",
  cost: "",
  billingCycle: "monthly",
  renewalDate: "",
  lastUsed: "unknown",
  notes: "",
};

function rowToState(sub: SubscriptionRow): FormState {
  return {
    name: sub.name,
    category: sub.category,
    cost: (sub.cost_cents / 100).toString(),
    billingCycle: sub.billing_cycle,
    renewalDate: sub.renewal_date ?? "",
    lastUsed: sub.last_used,
    notes: sub.notes ?? "",
  };
}

export type SubscriptionFormDefaults = Partial<Omit<FormState, "cost">> & {
  cost?: string;
};

export function SubscriptionForm({
  subscription,
  defaultValues,
  onSuccess,
  onCancel,
}: {
  subscription?: SubscriptionRow;
  defaultValues?: SubscriptionFormDefaults;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [state, setState] = React.useState<FormState>(() =>
    subscription ? rowToState(subscription) : { ...BLANK, ...defaultValues },
  );
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [isPending, startTransition] = React.useTransition();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!state.name.trim()) nextErrors.name = "Give it a name";
    const costNumber = Number(state.cost);
    if (!state.cost.trim() || Number.isNaN(costNumber) || costNumber < 0) {
      nextErrors.cost = "Enter a valid amount";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      name: state.name.trim(),
      category: state.category,
      costCents: Math.round(costNumber * 100),
      billingCycle: state.billingCycle,
      renewalDate: state.renewalDate ? state.renewalDate : null,
      lastUsed: state.lastUsed,
      notes: state.notes.trim() ? state.notes.trim() : null,
    };

    startTransition(async () => {
      const result = subscription
        ? await updateSubscription(subscription.id, input)
        : await createSubscription(input);

      if (result.ok) {
        toast.success(
          subscription ? "Subscription updated" : "Subscription added",
        );
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={state.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. ChatGPT Plus"
          aria-invalid={Boolean(errors.name)}
          autoFocus
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={state.category}
            onValueChange={(value) =>
              set("category", value as SubscriptionCategory)
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="cost"
              inputMode="decimal"
              className="pl-7"
              value={state.cost}
              onChange={(e) => set("cost", e.target.value)}
              placeholder="20.00"
              aria-invalid={Boolean(errors.cost)}
            />
          </div>
          {errors.cost && (
            <p className="text-sm text-destructive">{errors.cost}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="billingCycle">Billing cycle</Label>
          <Select
            value={state.billingCycle}
            onValueChange={(value) =>
              set("billingCycle", value as BillingCycle)
            }
          >
            <SelectTrigger id="billingCycle">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLING_CYCLES.map((cycle) => (
                <SelectItem key={cycle} value={cycle}>
                  {BILLING_LABELS[cycle]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="renewalDate">Renewal date</Label>
          <Input
            id="renewalDate"
            type="date"
            value={state.renewalDate}
            onChange={(e) => set("renewalDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastUsed">Last used</Label>
        <Select
          value={state.lastUsed}
          onValueChange={(value) => set("lastUsed", value as LastUsedValue)}
        >
          <SelectTrigger id="lastUsed">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAST_USED_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={state.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Anything worth remembering — e.g. shared with the team."
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="brand" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {subscription ? "Save changes" : "Add subscription"}
        </Button>
      </div>
    </form>
  );
}
