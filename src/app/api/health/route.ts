import { NextResponse } from "next/server";

import { APP_NAME } from "@/config/app";

/** Lightweight health check — confirms the `api/` route handlers are wired up. */
export function GET() {
  return NextResponse.json({
    app: APP_NAME,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
