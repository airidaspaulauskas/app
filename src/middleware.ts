import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Until Supabase env is configured, skip session refresh so the app still
  // boots locally. Once NEXT_PUBLIC_SUPABASE_URL is set, sessions refresh here.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next({ request });
  }

  return updateSession(request);
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
