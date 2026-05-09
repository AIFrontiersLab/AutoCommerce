import type { EnrichedProduct, NegotiationDraft, NegotiationTone, UserMemorySnapshot } from "../types";

const toneLabel: Record<NegotiationTone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  aggressive: "Aggressive",
  startup_founder: "Startup Founder",
  luxury_buyer: "Luxury Buyer",
};

function baseTargetPrice(p: EnrichedProduct): number {
  const floor = Math.round((p.estimatedFinalPriceAfterCoupon - 85) / 5) * 5;
  return Math.max(floor, Math.round(p.price * 0.82));
}

function acceptanceProbability(p: EnrichedProduct, target: number): number {
  const gap = (p.estimatedFinalPriceAfterCoupon - target) / p.estimatedFinalPriceAfterCoupon;
  const base = Math.round(58 + gap * 120);
  return Math.min(88, Math.max(32, base));
}

function shortListingLabel(p: EnrichedProduct): string {
  const t = p.title.trim();
  if (t.length <= 56) return t;
  return `${t.slice(0, 53)}…`;
}

function draftForTone(
  p: EnrichedProduct,
  tone: NegotiationTone,
  target: number,
): string {
  const seller = p.sellerName.split("(")[0]?.trim() ?? p.sellerName;
  const ship = p.shippingCost > 0 ? `shipped for $${target} all-in` : `at $${target} shipped`;
  const label = shortListingLabel(p);

  switch (tone) {
    case "professional":
      return (
        `Hello ${seller},\n\n` +
        `I'm prepared to purchase the ${label} today at $${target} ${ship.includes("all-in") ? "all-in" : "total"} if you can confirm condition and serial verification. ` +
        `Please advise if that works on your side.\n\nThank you,`
      );
    case "friendly":
      return (
        `Hi! I'm highly interested and ready to purchase today if you can do $${target} shipped. ` +
        `I can pay immediately if that works. Let me know 🙌`
      );
    case "aggressive":
      return (
        `I can close at $${target} all-in today — firm. Comp listings are lower; if you can't match, I'll move on within the hour.`
      );
    case "startup_founder":
      return (
        `Hey ${seller} — running a lean team and need “${label}” for a launch window. ` +
        `Can you do $${target} shipped if I pay now? Happy to complete quickly.`
      );
    case "luxury_buyer":
      return (
        `Good afternoon — I'm looking for a frictionless acquisition of this configuration. ` +
        `If you can accommodate $${target} with premium packaging and expedited handling, I'll finalize immediately.`
      );
    default:
      return `Offering $${target} — ready to buy now.`;
  }
}

/**
 * NegotiationAgent — composes seller outreach with calibrated tone.
 *
 * Production: call OpenAI Responses API with structured outputs + policy filters;
 * optionally A/B test messaging via bandits.
 */
export function runNegotiationAgent(
  enriched: EnrichedProduct[],
  memory: UserMemorySnapshot,
): NegotiationDraft[] {
  const ebaySorted = enriched
    .filter((p) => p.marketplace === "eBay")
    .sort(
      (a, b) =>
        b.trustScore - a.trustScore ||
        a.estimatedFinalPriceAfterCoupon - b.estimatedFinalPriceAfterCoupon,
    );
  const target =
    ebaySorted[0] ??
    [...enriched].sort(
      (a, b) => a.estimatedFinalPriceAfterCoupon - b.estimatedFinalPriceAfterCoupon,
    )[0];

  if (!target) return [];

  const tones: NegotiationTone[] = [
    "professional",
    "friendly",
    "aggressive",
    "startup_founder",
    "luxury_buyer",
  ];

  const primaryTone = memory.negotiationTone;

  const ordered = [primaryTone, ...tones.filter((t) => t !== primaryTone)] as NegotiationTone[];

  const price = baseTargetPrice(target);
  const unique = new Set<NegotiationTone>();

  return ordered
    .filter((t) => {
      if (unique.has(t)) return false;
      unique.add(t);
      return true;
    })
    .map((tone) => ({
      tone,
      message: draftForTone(target, tone, price),
      targetPriceUsd: price,
      acceptanceProbabilityPct: acceptanceProbability(target, price),
    }));
}

export { toneLabel };
