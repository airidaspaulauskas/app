"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { SmartPasteResult } from "@/lib/ai/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SmartPasteBox({
  onParsed,
}: {
  onParsed: (result: SmartPasteResult) => void;
}) {
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleParse() {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data: { result?: SmartPasteResult; error?: string } =
        await response.json();

      if (!response.ok || !data.result) {
        toast.error(data.error ?? "Couldn't parse that.");
        return;
      }

      onParsed(data.result);
      toast.success("Filled in from your text — review and save.");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-secondary/40 p-3">
      <label
        htmlFor="smart-paste"
        className="flex items-center gap-1.5 text-sm font-medium"
      >
        <Sparkles className="h-4 w-4 text-brand" />
        Smart add
      </label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Paste a receipt or describe it — e.g. &ldquo;ChatGPT Plus $20 a
        month&rdquo;. We&apos;ll fill in the form for you to confirm.
      </p>
      <Textarea
        id="smart-paste"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        className="mt-2 bg-background"
        placeholder="Paste an email receipt or type a quick description…"
      />
      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleParse}
          disabled={loading || !text.trim()}
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Parse with AI
        </Button>
      </div>
    </div>
  );
}
