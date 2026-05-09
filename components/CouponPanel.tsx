"use client";

import type { CouponFinding, EnrichedProduct } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketPercent } from "lucide-react";

export function CouponPanel({
  coupons,
  enriched,
}: {
  coupons: CouponFinding[];
  enriched: EnrichedProduct[];
}) {
  const savings = enriched.reduce((a, p) => a + p.couponSavings, 0);

  return (
    <Card className="border-white/60 bg-white/75 text-slate-800 shadow-[0_12px_40px_-16px_rgba(14,165,233,0.2)] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TicketPercent className="h-5 w-5 text-sky-600" />
          <div>
            <CardTitle className="text-base">Coupon intelligence</CardTitle>
            <CardDescription className="text-slate-600">Mock SAVE15 sweep across eligible carts</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {coupons.map((c) => (
            <Badge
              key={c.code}
              className="border border-cyan-300 bg-cyan-50 px-3 py-1 text-cyan-900"
              variant="outline"
            >
              {c.code} · {c.discountPct}% off
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-600">{coupons[0]?.description}</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-500">Estimated stack savings</div>
          <div className="mt-1 font-mono text-2xl text-emerald-700">${savings.toFixed(0)}</div>
          <p className="mt-1 text-[11px] text-slate-500">
            Production: affiliate feeds + cart automation via Playwright against allow-listed retailers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
