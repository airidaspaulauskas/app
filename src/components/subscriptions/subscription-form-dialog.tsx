"use client";

import * as React from "react";

import type { SmartPasteResult } from "@/lib/ai/types";
import type { SubscriptionRow } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SmartPasteBox } from "./smart-paste-box";
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
  const [prefill, setPrefill] = React.useState<
    SubscriptionFormDefaults | undefined
  >(defaultValues);
  // Bumping this remounts the form so smart-paste results populate the fields.
  const [formNonce, setFormNonce] = React.useState(0);

  // Reset prefill whenever the dialog is closed so the next open starts clean.
  React.useEffect(() => {
    if (!open) {
      setPrefill(defaultValues);
      setFormNonce((nonce) => nonce + 1);
    }
  }, [open, defaultValues]);

  function handleParsed(result: SmartPasteResult) {
    setPrefill({
      name: result.name,
      category: result.category,
      cost: result.costUsd ? String(result.costUsd) : "",
      billingCycle: result.billingCycle,
      renewalDate: result.renewalDate ?? "",
      notes: result.notes ?? "",
    });
    setFormNonce((nonce) => nonce + 1);
  }

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
              : "Paste a receipt to autofill, or enter the details manually. Annual costs are converted to a monthly figure for you."}
          </DialogDescription>
        </DialogHeader>

        {!isEdit && <SmartPasteBox onParsed={handleParsed} />}

        <SubscriptionForm
          key={subscription?.id ?? `create-${formNonce}`}
          subscription={subscription}
          defaultValues={isEdit ? undefined : prefill}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
