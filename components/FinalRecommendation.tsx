"use client";

import type { ComponentType } from "react";
import type { FinalRecommendation as FR } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingDown, Shield, Hammer, Crown } from "lucide-react";
import { motion } from "framer-motion";

function Mini({
  label,
  p,
  icon: Icon,
}: {
  label: string;
  p: FR["bestOverall"];
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-sky-600" />
        {label}
      </div>
      <div className="mt-1 line-clamp-2 text-sm text-slate-800">{p.title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline" className="border-emerald-200 text-[10px] text-emerald-800">
          ${p.estimatedFinalPriceAfterCoupon.toFixed(0)} all-in
        </Badge>
        <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-600">
          {p.marketplace}
        </Badge>
      </div>
    </div>
  );
}

export function FinalRecommendation({
  data,
  serpOrganicCount = 0,
}: {
  data: FR | null;
  /** Live Google organic rows merged this run (server-side SerpApi). */
  serpOrganicCount?: number;
}) {
  if (!data) {
    return (
      <Card className="border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base">Final recommendation</CardTitle>
          <CardDescription className="text-slate-600">Run the copilot to synthesize picks.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dataLine =
    serpOrganicCount > 0
      ? `Multi-agent consensus · ${serpOrganicCount} live web hit(s) from Google organic + local demo catalog`
      : "Multi-agent consensus · local demo catalog only (no SerpApi hits this run)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="border-white/60 bg-gradient-to-br from-white/90 via-cyan-50/50 to-fuchsia-50/60 text-slate-800 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle className="text-lg">Final recommendation</CardTitle>
              <CardDescription className="text-slate-600">{dataLine}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Mini label="Best overall deal" p={data.bestOverall} icon={Crown} />
            <Mini label="Cheapest deal" p={data.cheapest} icon={TrendingDown} />
            <Mini label="Safest seller" p={data.safestSeller} icon={Shield} />
            <Mini label="Best refurbished" p={data.bestRefurb} icon={Hammer} />
            <Mini label="Best negotiation target" p={data.bestNegotiationTarget} icon={Sparkles} />
            <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Price confidence</div>
              <div className="mt-1 font-mono text-3xl text-sky-700">{data.priceConfidence}%</div>
              <p className="mt-1 text-[11px] text-slate-500">Blended from listing freshness & seller signals (demo).</p>
            </div>
          </div>
          <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-4 text-sm leading-relaxed text-slate-700">
            <span className="font-semibold text-slate-900">Copilot summary · </span>
            {data.aiSummary}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
