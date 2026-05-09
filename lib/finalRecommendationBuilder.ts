import type { EnrichedProduct, FinalRecommendation } from "./types";
import { titleRelevance } from "./promptTokens";

function negotiationDraftUsd(top: EnrichedProduct): number {
  const floor = Math.round((top.estimatedFinalPriceAfterCoupon - 85) / 5) * 5;
  return Math.max(floor, Math.round(top.price * 0.82));
}

function acceptPct(top: EnrichedProduct, offer: number): number {
  const gap = (top.estimatedFinalPriceAfterCoupon - offer) / top.estimatedFinalPriceAfterCoupon;
  const base = Math.round(52 + gap * 120);
  return Math.min(88, Math.max(32, base));
}

function byOverallPick(enriched: EnrichedProduct[]): EnrichedProduct {
  return [...enriched].sort((a, b) => b.overallScore - a.overallScore)[0]!;
}

function promptAlignedProduct(enriched: EnrichedProduct[], userPrompt: string): EnrichedProduct {
  let best = enriched[0]!;
  let bestRel = -1;
  for (const p of enriched) {
    const rel = titleRelevance(p.title, userPrompt) + titleRelevance(p.chip, userPrompt) * 0.2;
    if (rel > bestRel) {
      bestRel = rel;
      best = p;
    }
  }
  return bestRel > 0 ? best : byOverallPick(enriched);
}

export function buildFinalRecommendation(
  enriched: EnrichedProduct[],
  userPrompt: string,
): FinalRecommendation {
  const byOverall = [...enriched].sort((a, b) => b.overallScore - a.overallScore);
  const byPrice = [...enriched].sort(
    (a, b) => a.estimatedFinalPriceAfterCoupon - b.estimatedFinalPriceAfterCoupon,
  );
  const byTrust = [...enriched].sort((a, b) => b.trustScore - a.trustScore);

  const refurbs = enriched.filter((p) => p.condition === "refurbished");
  const bestRefurb =
    refurbs.length > 0
      ? [...refurbs].sort((a, b) => {
          const trust = b.trustScore - a.trustScore;
          if (trust !== 0) return trust;
          return a.estimatedFinalPriceAfterCoupon - b.estimatedFinalPriceAfterCoupon;
        })[0]!
      : byOverall[0]!;

  const ebayPick = enriched
    .filter((p) => p.marketplace === "eBay")
    .sort((a, b) => b.trustScore - a.trustScore)[0];
  const bestNegotiationTarget = ebayPick ?? byOverall[0]!;

  const bestOverall = byOverall[0]!;
  const cheapest = byPrice[0]!;
  const safestSeller = byTrust[0]!;

  const summaryProduct = promptAlignedProduct(enriched, userPrompt);
  const neg = bestNegotiationTarget;
  const summaryPrice = summaryProduct.estimatedFinalPriceAfterCoupon;
  const summaryTrust = summaryProduct.trustScore;
  const shortTitle =
    summaryProduct.title.length > 72 ? `${summaryProduct.title.slice(0, 69)}…` : summaryProduct.title;
  const mission = userPrompt.trim().slice(0, 120);

  const draftOffer = negotiationDraftUsd(neg);
  const accept = acceptPct(neg, draftOffer);
  const negNote =
    neg.id !== summaryProduct.id
      ? ` For haggling, the modeled negotiation anchor is “${neg.title.length > 48 ? `${neg.title.slice(0, 45)}…` : neg.title}” on ${neg.marketplace} (~$${draftOffer} opening, ~${accept}% acceptance heuristic).`
      : ` I’d probe an opening around $${draftOffer} (~${accept}% modeled acceptance vs. list trajectory — not a guarantee).`;

  const aiSummary =
    `For “${mission}${userPrompt.trim().length > 120 ? "…" : ""}”, the top match in this pass is “${shortTitle}” at about $${summaryPrice.toFixed(0)} all-in (after coupons/shipping where modeled). ` +
    `Seller trust is ~${summaryTrust}%.${negNote}`;

  const priceConfidence = Math.round(
    enriched.reduce((s, p) => s + p.priceConfidence, 0) / enriched.length,
  );

  return {
    bestOverall,
    cheapest,
    safestSeller,
    bestRefurb,
    bestNegotiationTarget,
    aiSummary,
    priceConfidence,
  };
}
