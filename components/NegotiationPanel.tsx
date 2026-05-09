"use client";

import { useEffect, useState } from "react";
import type { NegotiationDraft, NegotiationTone } from "@/lib/types";
import { toneLabel } from "@/lib/agents/negotiationAgent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquareText, Sparkles } from "lucide-react";

const TONES: NegotiationTone[] = [
  "professional",
  "friendly",
  "aggressive",
  "startup_founder",
  "luxury_buyer",
];

export function NegotiationPanel({
  drafts,
  disabled,
}: {
  drafts: NegotiationDraft[];
  disabled?: boolean;
}) {
  const byTone = Object.fromEntries(drafts.map((d) => [d.tone, d])) as Partial<
    Record<NegotiationTone, NegotiationDraft>
  >;

  const [tone, setTone] = useState<NegotiationTone>(drafts[0]?.tone ?? "friendly");
  const active = byTone[tone] ?? drafts[0];
  const [text, setText] = useState(active?.message ?? "");
  const [enhancing, setEnhancing] = useState(false);
  const [userEdited, setUserEdited] = useState(false);

  useEffect(() => {
    if (userEdited || enhancing) return;
    const d = byTone[tone];
    if (d) setText(d.message);
  }, [tone, byTone, userEdited, enhancing]);

  async function enhance() {
    setEnhancing(true);
    try {
      const res = await fetch("/api/copilot/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: text,
          system:
            "Polish negotiation copy only. Never change dollar amounts unless fixing typos. No checkout promises.",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; text?: string };
      if (data.ok && data.text) {
        setText(data.text.trim());
        setUserEdited(true);
      }
    } finally {
      setEnhancing(false);
    }
  }

  return (
    <Card className="border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(232,121,249,0.15)] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-fuchsia-600" />
          <div>
            <CardTitle className="text-base">Negotiation drafts</CardTitle>
            <CardDescription className="text-slate-600">
              Editable outreach — tone presets with acceptance priors (demo)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Tone</Label>
            <select
              disabled={disabled || !drafts.length}
              className="flex h-10 w-full rounded-md border border-sky-200 bg-white px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-400/40"
              value={tone}
              onChange={(e) => {
                setTone(e.target.value as NegotiationTone);
                setUserEdited(false);
              }}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {toneLabel[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600">Target & acceptance</Label>
            <div className="flex h-10 items-center rounded-md border border-slate-200 bg-slate-50 px-3 font-mono text-xs text-sky-800">
              ${active?.targetPriceUsd ?? "—"} · {active?.acceptanceProbabilityPct ?? "—"}% est. accept
            </div>
          </div>
        </div>
        <Textarea
          disabled={disabled}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setUserEdited(true);
          }}
          className="min-h-[140px] border-sky-200 bg-white font-sans text-sm text-slate-800"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || enhancing}
            onClick={enhance}
            className="gap-2 border-sky-200 bg-white/90 text-slate-800 shadow-sm hover:bg-white"
          >
            <Sparkles className="h-4 w-4" />
            {enhancing ? "Enhancing…" : "Enhance with OpenAI (optional)"}
          </Button>
          <p className="text-[11px] text-slate-500">
            Uses Responses API when OPENAI_API_KEY is set.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
