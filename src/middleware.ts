import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Skip session refresh until BOTH public Supabase vars are present — a
  // partial config would otherwise throw when constructing the client.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  // Session refresh is best-effort. If it throws (bad env, transport error,
  // edge-runtime quirk), never 500 the entire site — fall through and let each
  // route's own server-side guard (requireUser) handle auth.
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("middleware session refresh failed; continuing", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files so the
     * session cookie is refreshed on navigations and data requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
