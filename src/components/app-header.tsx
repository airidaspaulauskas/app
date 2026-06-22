"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { APP_NAME, type PlanTier } from "@/config/app";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/billing", label: "Billing" },
] as const;

export function AppHeader({
  email,
  planTier,
}: {
  email: string;
  planTier: PlanTier;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-serif text-lg font-semibold tracking-tight"
          >
            {APP_NAME}
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          {planTier === "free" && (
            <Button asChild size="sm" variant="brand" className="hidden sm:flex">
              <Link href="/billing">
                <Sparkles />
                Upgrade
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <UserMenu email={email} planTier={planTier} />
        </div>
      </div>
    </header>
  );
}
