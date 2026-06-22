"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SubscriptionRow } from "@/types/database";
import {
  SubscriptionForm,
  type SubscriptionFormDefaults,
} from "./subscription-form";

export function SubscriptionFormDialog({
  open,
  onOpenChange,
  subscription,
  defaultValues,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionRow;
  defaultValues?: SubscriptionFormDefaults;
}) {
  const isEdit = Boolean(subscription);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit subscription" : "Add a subscription"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details below."
              : "Track a tool or service. Annual costs are converted to a monthly figure for you."}
          </DialogDescription>
        </DialogHeader>
        <SubscriptionForm
          key={subscription?.id ?? "create"}
          subscription={subscription}
          defaultValues={defaultValues}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
