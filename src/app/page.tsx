import Link from "next/link";
import { ArrowRight, ScanSearch, Sparkles, Wallet } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/config/app";

const FEATURES = [
  {
    icon: ScanSearch,
    title: "See everything at once",
    body: "Add your AI tools and SaaS in seconds — or paste a receipt and let Claude fill in the details.",
  },
  {
    icon: Sparkles,
    title: "Catch the overlap",
    body: "Spot redundant tools and forgotten renewals before they bill you again.",
  },
  {
    icon: Wallet,
    title: "Know what to cut",
    body: "A ranked, dollar-quantified list of exactly what to cancel first.",
  },
] as const;

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-serif text-xl font-semibold tracking-tight">
            {APP_NAME}
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container flex flex-col items-center py-24 text-center md:py-32">
          <span className="mb-5 inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Subscription intelligence for the AI era
          </span>
          <h1 className="max-w-3xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
            {APP_NAME} finds every tool you pay for, flags the overlapping and
            unused ones, and tells you exactly what to cancel to save money — in
            under two minutes.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="brand">
              <Link href="/login">
                Get started free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">View the dashboard</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Free for up to 5 subscriptions. No card required.
          </p>
        </section>

        <section className="container grid gap-6 pb-24 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-medium">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {APP_NAME}
          </span>
          <span>Built for people drowning in subscriptions.</span>
        </div>
      </footer>
    </div>
  );
}
