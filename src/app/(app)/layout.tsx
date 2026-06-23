import { AppHeader } from "@/components/app-header";
import { requireUser } from "@/lib/auth/session";

/**
 * Authenticated app shell. `requireUser()` redirects to /login when there is no
 * session, so every page rendered inside this layout can assume an authed user.
 */
export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>
      <AppHeader email={user.email ?? ""} planTier={profile.plan_tier} />
      <main id="content" className="container flex-1 py-8">
        {children}
      </main>
    </div>
  );
}
