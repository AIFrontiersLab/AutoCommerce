"use client";

import { useState } from "react";
import { AgentActivityFeed } from "@/components/AgentActivityFeed";
import { ProductComparisonTable } from "@/components/ProductComparisonTable";
import { NegotiationPanel } from "@/components/NegotiationPanel";
import { CouponPanel } from "@/components/CouponPanel";
import { TrustScoreCard } from "@/components/TrustScoreCard";
import { BrowserAutomationViewer } from "@/components/BrowserAutomationViewer";
import { FinalRecommendation } from "@/components/FinalRecommendation";
import { SafetyApprovalBanner } from "@/components/SafetyApprovalBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { initialActivitySteps, runAnimatedAgentDemo } from "@/lib/agentOrchestrator";
import type { AgentActivityStep, CopilotRunState } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Play, Radar } from "lucide-react";
import { NeonFrontiersBackdrop } from "@/components/NeonFrontiersBackdrop";

const DEFAULT_PROMPT =
  "Find the cheapest MacBook Pro M4 with 32GB RAM under $2K and negotiate the best deal.";

export function AgentDashboard() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [steps, setSteps] = useState<AgentActivityStep[]>(() => initialActivitySteps());
  const [state, setState] = useState<CopilotRunState | null>(null);
  const [running, setRunning] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [runError, setRunError] = useState<string | null>(null);

  /** Enter runs agents; Shift+Enter inserts a newline (textarea default). */
  function handlePromptKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (running || e.nativeEvent.isComposing) return;
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault();
    void run();
  }

  async function run() {
    setRunning(true);
    setSteps(initialActivitySteps());
    setState(null);
    setRunError(null);
    try {
      const res = await fetch("/api/copilot/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = (await res.json()) as { ok?: boolean; state?: CopilotRunState; error?: string };
      if (!res.ok || !data.ok || !data.state) {
        setRunError(data.error ?? res.statusText ?? "Could not run agents.");
        return;
      }
      await runAnimatedAgentDemo(data.state, {
        onSteps: setSteps,
        onState: setState,
        stepDelayMs: 480,
      });
      setRunKey((k) => k + 1);
    } finally {
      setRunning(false);
    }
  }

  const trustProduct =
    state?.final?.bestNegotiationTarget ?? state?.enriched[0] ?? null;

  const scamNote = state?.fakeDiscountWarnings?.length
    ? state.fakeDiscountWarnings[0]
    : null;

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-800">
      <NeonFrontiersBackdrop variant="light" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-2 text-xs text-slate-600 transition-colors hover:text-sky-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200/80 bg-white/70 shadow-[0_8px_30px_-8px_rgba(14,165,233,0.35)] backdrop-blur-md">
                <Radar className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="bg-gradient-to-br from-slate-900 via-sky-800 to-fuchsia-700 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                  Autonomous Commerce Copilot
                </h1>
                <p className="text-sm text-slate-600">Negotiation & purchasing runtime — demo mode</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={run}
              disabled={running}
              className="gap-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-500 font-semibold text-slate-900 shadow-[0_0_32px_-4px_rgba(56,189,248,0.75)] hover:opacity-95"
            >
              <Play className="h-4 w-4" />
              {running ? "Agents running…" : "Run agents"}
            </Button>
          </div>
        </header>

        <div className="mb-6 space-y-3">
          <SafetyApprovalBanner />
          {runError ? (
            <Alert className="border-amber-200 bg-amber-50/90 text-amber-950 backdrop-blur-md">
              <AlertTitle className="text-amber-900">Run failed</AlertTitle>
              <AlertDescription className="text-amber-900/90">{runError}</AlertDescription>
            </Alert>
          ) : null}
          {scamNote ? (
            <Alert className="border-rose-200 bg-rose-50/90 text-rose-950 backdrop-blur-md">
              <AlertTitle className="text-rose-900">Scam / discount signal</AlertTitle>
              <AlertDescription className="text-rose-900/90">{scamNote}</AlertDescription>
            </Alert>
          ) : null}
          {state?.serpKeyConfigured && state.serpFetchError ? (
            <Alert className="border-amber-200 bg-amber-50/90 text-amber-950 backdrop-blur-md">
              <AlertTitle className="text-amber-900">SerpApi did not return results</AlertTitle>
              <AlertDescription className="text-amber-900/90">
                {state.serpFetchError} Check the key in{" "}
                <code className="rounded bg-white/80 px-1">.env.local</code>, plan limits, and restart{" "}
                <code className="rounded bg-white/80 px-1">next dev</code>.
              </AlertDescription>
            </Alert>
          ) : null}
          {state && !state.serpKeyConfigured ? (
            <Alert className="border-sky-200 bg-sky-50/90 text-slate-900 backdrop-blur-md">
              <AlertTitle className="text-sky-950">Live search off</AlertTitle>
              <AlertDescription className="text-sky-950/90">
                The server still sees an empty SerpApi key. Use one line:{" "}
                <code className="rounded bg-white/90 px-1">SERPAPI_API_KEY=your_key</code> in{" "}
                <code className="rounded bg-white/90 px-1">.env.local</code> next to{" "}
                <code className="rounded bg-white/90 px-1">package.json</code>, then <strong>save the file</strong> (the
                editor can show the key before it is written to disk). Restart <code className="rounded bg-white/90 px-1">next dev</code> if needed. Avoid smart quotes around the value.
              </AlertDescription>
            </Alert>
          ) : null}
          {state?.serpKeyConfigured && !state.serpFetchError && state.serpOrganicEmpty ? (
            <Alert className="border-slate-200 bg-slate-50/90 text-slate-900 backdrop-blur-md">
              <AlertTitle className="text-slate-800">SerpApi returned no organic results</AlertTitle>
              <AlertDescription className="text-slate-800/90">
                The key is loaded, but this query returned no parsed Google organic links. Try a simpler product
                search string.
              </AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-5">
            <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
              <Label htmlFor="prompt" className="text-xs text-slate-600">
                Mission prompt
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                disabled={running}
                className="mt-2 min-h-[100px] cursor-text border-sky-200 bg-white text-sm text-slate-800"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Press <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">Enter</kbd>{" "}
                to run agents (same as the header button). Use{" "}
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">Shift</kbd>
                +
                <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">Enter</kbd> for
                a new line. The demo catalog is mostly laptops and electronics — missions like &quot;shoes&quot; need{" "}
                <code className="rounded bg-sky-50 px-1 text-slate-700">SERPAPI_API_KEY</code> in{" "}
                <code className="rounded bg-sky-50 px-1 text-slate-700">.env.local</code> so the server can merge live
                Google organic results (titles/links/snippets — not a direct Amazon scrape). Restart{" "}
                <code className="rounded bg-sky-50 px-1 text-slate-700">next dev</code> after adding the key.
              </p>
            </div>
            <AgentActivityFeed steps={steps} />
            <BrowserAutomationViewer active={running} />
          </section>

          <section className="space-y-4 lg:col-span-7">
            {state ? (
              <>
                {state.final ? (
                  <FinalRecommendation data={state.final} serpOrganicCount={state.serpOrganicCount} />
                ) : null}
                {state.enriched.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-white/70 p-4 text-center text-sm text-slate-600">
                    {state.serpOrganicCount === 0
                      ? "No listings matched your mission keywords in the local catalog. Add SerpApi (see note under the prompt) for live web rows, or use keywords that appear in the demo products."
                      : "No listings passed filters after merging live web hits. Try widening budget or RAM/chip hints from the prompt."}
                  </p>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <TrustScoreCard product={trustProduct} />
                  <CouponPanel coupons={state.coupons} enriched={state.enriched} />
                </div>
                <ProductComparisonTable rows={state.enriched} />
                <NegotiationPanel key={runKey} drafts={state.negotiations} disabled={running} />
              </>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-sky-200/80 bg-white/50 p-8 text-center text-sm text-slate-600 shadow-[inset_0_0_40px_-20px_rgba(14,165,233,0.12)] backdrop-blur-sm">
                Run agents to populate comparison, trust, coupons, and negotiation drafts.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
