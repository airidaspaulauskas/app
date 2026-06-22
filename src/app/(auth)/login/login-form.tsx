"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

import { signInWithEmail, type SignInState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL: SignInState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="brand" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Sending link…
        </>
      ) : (
        <>
          <Mail />
          Send magic link
        </>
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(signInWithEmail, INITIAL);

  if (state.status === "sent") {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-lg border bg-secondary/50 p-6 text-center"
        role="status"
      >
        <CheckCircle2 className="h-8 w-8 text-success" />
        <div>
          <p className="font-medium">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{state.email}</span>.
            It expires shortly — open it on this device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "email-error" : undefined}
        />
        {state.status === "error" && (
          <p id="email-error" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
      <SubmitButton />
      <p className="text-center text-xs text-muted-foreground">
        No password needed. We&apos;ll email you a secure sign-in link.
      </p>
    </form>
  );
}
