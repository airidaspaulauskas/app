import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

/** Paths reachable while signed out. Everything else (except /api/*) requires auth. */
const PUBLIC_PATHS = ["/", "/login"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  // Auth callback + error pages must be reachable while signed out.
  return pathname.startsWith("/auth");
}

/**
 * Refreshes the Supabase auth session on every request, keeps the auth cookies
 * in sync between request and response, and gates protected routes. Must run
 * from `middleware.ts`. Do not insert logic between `createServerClient` and
 * `getUser()` — it can cause hard-to-debug session bugs.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session so Server Components always see a valid user.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API route handlers do their own auth and return JSON — never redirect them.
  if (pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  // Signed-out users hitting a protected page → /login.
  if (!user && !isPublicPath(pathname)) {
    return redirectWithCookies(request, supabaseResponse, "/login");
  }

  // Signed-in users hitting /login → /dashboard.
  if (user && pathname === "/login") {
    return redirectWithCookies(request, supabaseResponse, "/dashboard");
  }

  return supabaseResponse;
}

/** Redirect while preserving any refreshed auth cookies. */
function redirectWithCookies(
  request: NextRequest,
  source: NextResponse,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const response = NextResponse.redirect(url);
  source.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
