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
      <AppHeader email={user.email ?? ""} planTier={profile.plan_tier} />
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
