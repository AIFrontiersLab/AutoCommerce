"use client";

import type { EnrichedProduct } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ShieldOff } from "lucide-react";

export function TrustScoreCard({ product }: { product: EnrichedProduct | null }) {
  if (!product) {
    return (
      <Card className="border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Trust & seller signals</CardTitle>
          <CardDescription className="text-slate-600">Run the agent to evaluate sellers.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const risky = product.scamRisk === "high";

  return (
    <Card
      className={`border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(192,132,252,0.18)] backdrop-blur-xl ${risky ? "border-rose-200 ring-1 ring-rose-100" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {risky ? (
            <ShieldOff className="h-5 w-5 text-rose-600" />
          ) : (
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          )}
          <div>
            <CardTitle className="text-base">Trust & seller signals</CardTitle>
            <CardDescription className="text-slate-600">{product.marketplace}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Composite trust score</span>
            <span className="font-mono text-slate-800">{product.trustScore}%</span>
          </div>
          <Progress value={product.trustScore} className="mt-1 h-2 bg-slate-200" />
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-3 text-xs leading-relaxed text-slate-700">
          <p className="font-medium text-slate-900">Scam / policy readout</p>
          <p className="mt-1">{product.trustNarrative}</p>
          <p className="mt-2 text-[11px] text-slate-500">
            Price-confidence {product.priceConfidence}% — mock heuristic, not a guarantee.
          </p>
        </div>
        <div className="text-xs text-slate-600">
          <span className="text-slate-800">Returns:</span> {product.returnPolicy}
        </div>
      </CardContent>
    </Card>
  );
}
