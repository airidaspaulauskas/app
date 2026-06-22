import { redirect } from "next/navigation";
import { ListPlus, PiggyBank, Sparkles } from "lucide-react";

import { completeOnboarding } from "@/lib/onboarding/actions";
import { requireUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/app";

export const metadata = { title: "Welcome" };

const STEPS = [
  {
    icon: ListPlus,
    title: "Add your subscriptions",
    body: "Add each tool manually, or paste a receipt and let AI fill in the details.",
  },
  {
    icon: PiggyBank,
    title: "See your real spend",
    body: "Your total monthly burn, annualized cost, and upcoming renewals — at a glance.",
  },
  {
    icon: Sparkles,
    title: "Get your first savings",
    body: "We surface overlapping and unused tools, ranked by how much you'd save.",
  },
] as const;

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  if (profile.onboarded) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-brand">Welcome to {APP_NAME}</p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Find what to cancel in three steps
        </h1>
        <p className="text-muted-foreground">
          It takes about two minutes. Here&apos;s how it works.
        </p>
      </div>

      <ol className="mt-10 space-y-4">
        {STEPS.map(({ icon: Icon, title, body }, index) => (
          <li
            key={title}
            className="flex items-start gap-4 rounded-xl border bg-card p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h2 className="font-medium">{title}</h2>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ol>

      <form action={completeOnboarding} className="mt-8 flex justify-center">
        <Button type="submit" size="lg" variant="brand">
          Add my first subscription
        </Button>
      </form>
    </div>
  );
}
