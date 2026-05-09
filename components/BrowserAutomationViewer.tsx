"use client";

import { useEffect, useState } from "react";
import type { BrowserAutomationFrame } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, MousePointer2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_SEQUENCE: BrowserAutomationFrame[] = [
  {
    id: "t1",
    title: "Amazon — PDP",
    url: "https://amazon.com/dp/demo-m4-32",
    status: "loading",
    logLine: "Parsing title, price, Prime badge, return window…",
  },
  {
    id: "t2",
    title: "Best Buy — Compare",
    url: "https://bestbuy.com/site/demo",
    status: "loading",
    logLine: "Scraping open-box delta vs. new SKU…",
  },
  {
    id: "t3",
    title: "eBay — Seller profile",
    url: "https://ebay.com/usr/demo-seller",
    status: "loading",
    logLine: "Top Rated Plus, feedback velocity, dispute rate heuristics…",
  },
  {
    id: "t4",
    title: "Checkout — Coupon",
    url: "https://cart.demo/apply-save15",
    status: "loading",
    logLine: "Injecting SAVE15, recomputing tax/shipping (read-only)…",
  },
];

/**
 * Visualizes autonomous browsing — no real navigation in this demo.
 *
 * Production: drive Playwright locally or via Browserbase/Steel remote Chromium.
 * Swap `DEMO_SEQUENCE` for live CDP events streamed over SSE/WebSocket.
 */
export function BrowserAutomationViewer({ active }: { active: boolean }) {
  const [idx, setIdx] = useState(0);
  const [frames, setFrames] = useState<BrowserAutomationFrame[]>(() =>
    DEMO_SEQUENCE.map((f, i) => ({ ...f, status: i === 0 ? "loading" : "idle" })),
  );

  useEffect(() => {
    if (!active) {
      setIdx(0);
      setFrames(DEMO_SEQUENCE.map((f) => ({ ...f, status: "idle" })));
      return;
    }

    let i = 0;
    const tick = () => {
      setFrames((prev) =>
        prev.map((f, j) => ({
          ...f,
          status: j < i ? "complete" : j === i ? "loading" : "idle",
        })),
      );
      setIdx(i);
      i = (i + 1) % DEMO_SEQUENCE.length;
    };
    tick();
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, [active]);

  const current = frames[idx] ?? frames[0];

  return (
    <Card className="border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sky-600" />
            <div>
              <CardTitle className="text-base">Watch agent browse</CardTitle>
              <CardDescription className="text-slate-600">
                Simulated Playwright trace — tabs, totals, coupons, seller signals
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
            <Shield className="mr-1 h-3 w-3" />
            Read-only demo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {frames.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cn(
                "shrink-0 rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors",
                f.status === "complete" && "border-emerald-200 bg-emerald-50 text-emerald-900",
                f.status === "loading" && "border-sky-300 bg-sky-50 text-sky-900",
                f.status === "idle" && "border-slate-200 bg-slate-50 text-slate-500",
              )}
            >
              {f.title}
            </button>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-sky-50/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] text-slate-500">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500/80" />
              <span className="h-2 w-2 rounded-full bg-amber-400/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
            <span className="truncate font-mono text-[10px] text-sky-700">{current?.url}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="min-h-[100px] rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <MousePointer2 className="mt-0.5 h-4 w-4 text-fuchsia-600" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{current?.title}</div>
                  <p className="mt-1 font-mono text-xs text-sky-700">{current?.logLine}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          Remote browsers: point Playwright at Browserbase or Steel.dev session URLs; stream frames to this panel for
          investor-grade “over the shoulder” demos.
        </p>
      </CardContent>
    </Card>
  );
}
