"use client";

import type { EnrichedProduct } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductComparisonTable({ rows }: { rows: EnrichedProduct[] }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-slate-800">Product comparison</h2>
        <p className="text-xs text-slate-500">Specs, economics, and composite scores across marketplaces</p>
      </div>
      <ScrollArea className="w-full">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-3 font-medium">Listing</th>
              <th className="pb-2 pr-3 font-medium">Market</th>
              <th className="pb-2 pr-3 font-medium">All-in</th>
              <th className="pb-2 pr-3 font-medium">Trust</th>
              <th className="pb-2 pr-3 font-medium">Risk</th>
              <th className="pb-2 pr-3 font-medium">Δ30d</th>
              <th className="pb-2 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-slate-100 transition-colors hover:bg-sky-50/50",
                  p.id === "ebay-m4-pro-32-main" && "bg-sky-50/80",
                )}
              >
                <td className="max-w-[220px] py-2 pr-3">
                  <div className="line-clamp-2 font-medium text-slate-800">{p.title}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-600">
                      {p.chip}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-600">
                      {p.ramGb}GB
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-[10px] text-slate-600">
                      {p.condition.replace("_", " ")}
                    </Badge>
                  </div>
                </td>
                <td className="py-2 pr-3 text-slate-700">{p.marketplace}</td>
                <td className="py-2 pr-3">
                  <div className="font-mono text-emerald-700">
                    ${p.estimatedFinalPriceAfterCoupon.toFixed(0)}
                  </div>
                  {p.couponSavings > 0 ? (
                    <div className="text-[10px] text-sky-700">−${p.couponSavings.toFixed(0)} coupon</div>
                  ) : null}
                </td>
                <td className="py-2 pr-3 font-mono text-slate-800">{p.trustScore}%</td>
                <td className="py-2 pr-3">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                      p.scamRisk === "low" && "bg-emerald-100 text-emerald-800",
                      p.scamRisk === "medium" && "bg-amber-100 text-amber-900",
                      p.scamRisk === "high" && "bg-rose-100 text-rose-800",
                    )}
                  >
                    {p.scamRisk}
                  </span>
                </td>
                <td className="py-2 pr-3 font-mono text-slate-700">
                  {p.predictedPriceChange30dPct > 0 ? "+" : ""}
                  {p.predictedPriceChange30dPct}%
                </td>
                <td className="py-2 font-mono text-sky-700">{Math.round(p.overallScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
