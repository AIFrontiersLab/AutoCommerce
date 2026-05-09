import type { EnrichedProduct } from "../types";

/**
 * TrustAgent — composite seller + policy + behavioral risk scoring.
 *
 * Production: ingest review graphs, chargeback rates, marketplace badges, and OSINT signals.
 */
export function runTrustAgent(enriched: EnrichedProduct[]): EnrichedProduct[] {
  return enriched.map((p) => {
    let trustNarrative = `Seller rating ${p.sellerRating.toFixed(1)}/5.0; ${p.returnPolicy}.`;
    let scamRisk = p.scamRisk;
    let priceConfidence = p.priceConfidence;

    if (p.marketplace === "Facebook Marketplace" && (p.wasPrice ?? 0) > 3500) {
      scamRisk = "high";
      priceConfidence = 38;
      trustNarrative +=
        " Inflated “was” pricing pattern — possible fake discount signaling.";
    }

    if (p.marketplace === "eBay" && p.sellerRating >= 4.9) {
      trustNarrative += " Top Rated Plus history reduces fulfillment risk.";
    }

    if (p.condition === "refurbished" && p.marketplace === "Apple Refurbished") {
      scamRisk = "low";
      priceConfidence = 96;
    }

    return { ...p, trustNarrative, scamRisk, priceConfidence };
  });
}
