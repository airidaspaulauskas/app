import { NextResponse } from "next/server";
import { z } from "zod";

import { isAiConfigured } from "@/lib/ai/client";
import { parseSubscriptionText } from "@/lib/ai/smart-paste";
import { getOptionalUser } from "@/lib/auth/session";

const bodySchema = z.object({
  text: z.string().trim().min(1).max(6000),
});

export async function POST(request: Request) {
  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  if (!isAiConfigured()) {
    return NextResponse.json(
      { error: "AI isn't configured on this server." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Paste some text describing the subscription." },
      { status: 400 },
    );
  }

  try {
    const result = await parseSubscriptionText(parsed.data.text);
    if (!result) {
      return NextResponse.json(
        {
          error:
            "Couldn't read that. Try rephrasing — e.g. “ChatGPT Plus $20/mo”.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error("smart-paste parse failed", error);
    return NextResponse.json(
      { error: "The AI request failed. Try again." },
      { status: 502 },
    );
  }
}
