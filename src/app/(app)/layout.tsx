import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/config/app";

/**
 * Authenticated app shell. The auth guard (redirect unauthenticated users to
 * /login) and the full navigation are added in Milestone 2.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard"
            className="font-serif text-lg font-semibold tracking-tight"
          >
            {APP_NAME}
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
