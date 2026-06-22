"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { SubscriptionFormDialog } from "./subscription-form-dialog";

export function AddSubscriptionButton({
  label = "Add subscription",
  variant = "brand",
  size = "default",
  className,
}: {
  label?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus />
        {label}
      </Button>
      <SubscriptionFormDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
