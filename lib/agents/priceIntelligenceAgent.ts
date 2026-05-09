import type { EnrichedProduct } from "../types";

/**
 * PriceIntelligenceAgent — forecasts near-term price trajectory.
 *
 * Production: time-series on historical carts, camelcamelcamel-style charts, or internal pricing models.
 */
export function runPriceIntelligenceAgent(enriched: EnrichedProduct[]): EnrichedProduct[] {
  return enriched.map((p) => {
    let predictedPriceChange30dPct = p.predictedPriceChange30dPct;
    let priceConfidence = p.priceConfidence;

    if (p.marketplace === "Apple Refurbished") {
      predictedPriceChange30dPct = -2;
      priceConfidence = Math.min(98, priceConfidence + 8);
    }
    if (p.marketplace === "Amazon" || p.marketplace === "Best Buy" || p.marketplace === "Walmart") {
      predictedPriceChange30dPct = -6;
    }
    if (p.marketplace === "Facebook Marketplace") {
      predictedPriceChange30dPct = 5;
      priceConfidence = Math.min(priceConfidence, 44);
    }
    if (p.marketplace === "eBay" && p.condition === "refurbished") {
      predictedPriceChange30dPct = -8;
    }

    return { ...p, predictedPriceChange30dPct, priceConfidence };
  });
}
