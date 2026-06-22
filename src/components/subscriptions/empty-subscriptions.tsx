import { Receipt } from "lucide-react";

import { AddSubscriptionButton } from "@/components/subscriptions/add-subscription-button";

export function EmptySubscriptions() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
        <Receipt className="h-6 w-6" />
      </div>
      <h2 className="mt-4 font-serif text-xl font-semibold tracking-tight">
        No subscriptions yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add your first tool to see your real monthly spend and where you could
        save. Paste a receipt and let AI fill in the details, or add it manually.
      </p>
      <div className="mt-6">
        <AddSubscriptionButton size="lg" label="Add your first subscription" />
      </div>
    </div>
  );
}
