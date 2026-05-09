import type { EnrichedProduct, Product, UserMemorySnapshot } from "../types";
import { titleRelevance } from "../promptTokens";

/**
 * ComparisonAgent — ranks offers on specs, fulfillment, and all-in economics.
 *
 * Production: enrich with live tax/VAT, inventory, and delivery date confidence.
 */
export function runComparisonAgent(
  products: Product[],
  memory: UserMemorySnapshot,
  userPrompt: string,
): EnrichedProduct[] {
  const budget = memory.budgetUsd ?? 2500;

  return products.map((p) => {
    const rel = titleRelevance(p.title, userPrompt);
    const ramT = memory.ramGb;
    const chipT = memory.chipFamily;

    let specMatchScore = Math.round(68 + rel * 32);

    if (ramT != null && p.ramGb > 0) {
      specMatchScore = p.ramGb === ramT ? Math.max(specMatchScore, 95) : 52;
    }
    if (chipT) {
      specMatchScore = p.chip.toLowerCase().includes(chipT.toLowerCase())
        ? Math.min(100, specMatchScore + 8)
        : Math.max(38, specMatchScore - 28);
    }
    if (p.ramGb === 0) {
      specMatchScore = Math.round(62 + rel * 38);
    }

    const shippingScore =
      memory.shippingPreference === "fastest"
        ? Math.max(0, 100 - p.shippingDays * 12)
        : Math.max(0, 100 - p.shippingDays * 6);

    const priceRatio = p.estimatedFinalPrice / budget;
    const valueScore = Math.max(0, Math.min(100, 115 - priceRatio * 55));

    const overallScore =
      specMatchScore * 0.35 +
      valueScore * 0.35 +
      shippingScore * 0.15 +
      p.trustScore * 0.15;

    return {
      ...p,
      appliedCoupons: [],
      couponSavings: 0,
      estimatedFinalPriceAfterCoupon: p.estimatedFinalPrice,
      specMatchScore,
      shippingScore,
      valueScore,
      overallScore,
      trustNarrative: "",
      scamRisk: p.trustScore < 65 ? "high" : p.trustScore < 80 ? "medium" : "low",
      priceConfidence: p.ramGb === 0 ? 55 : 72,
      predictedPriceChange30dPct: -4,
    };
  });
}
