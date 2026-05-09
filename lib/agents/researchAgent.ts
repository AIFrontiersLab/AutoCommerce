import type { Product, UserMemorySnapshot } from "../types";
import { MOCK_CATALOG_ALL } from "../mockProducts";
import { titleRelevance } from "../promptTokens";

/**
 * ResearchAgent — discovers candidate SKUs across marketplaces.
 *
 * With SERPAPI_API_KEY (server), live Google organic rows are prepended in `buildCopilotState`.
 * Otherwise this ranks the local mock catalog by prompt keyword overlap, budget, and optional RAM/chip hints.
 */
export function runResearchAgent(
  userPrompt: string,
  memory: UserMemorySnapshot,
  catalog: Product[] = MOCK_CATALOG_ALL,
): Product[] {
  const ram = memory.ramGb;
  const chipNeed = memory.chipFamily;

  const candidates = catalog.filter((p) => {
    const ramOk =
      ram == null || p.ramGb === 0 || p.ramGb === ram;
    const chipOk =
      !chipNeed ||
      p.chip.toLowerCase().includes(chipNeed.toLowerCase());
    const projectedAllIn = p.couponEligible
      ? p.price * 0.85 + p.shippingCost
      : p.price + p.shippingCost;
    const budgetOk =
      memory.budgetUsd == null ? true : projectedAllIn <= memory.budgetUsd * 1.05;
    return ramOk && chipOk && budgetOk;
  });

  const scored = candidates.map((p) => {
    const rel =
      titleRelevance(p.title, userPrompt) + titleRelevance(p.chip, userPrompt) * 0.2;
    return { p, rel };
  });

  const threshold = 0.07;
  let ranked = scored.filter((s) => s.rel >= threshold);
  if (ranked.length === 0) {
    ranked = scored
      .filter((s) => s.rel > 0)
      .sort((a, b) => b.rel - a.rel)
      .slice(0, 14);
  }
  if (ranked.length === 0) {
    return [];
  }

  ranked.sort((a, b) => {
    if (Math.abs(b.rel - a.rel) > 0.03) return b.rel - a.rel;
    const pa = a.p.couponEligible
      ? a.p.price * 0.85 + a.p.shippingCost
      : a.p.price + a.p.shippingCost;
    const pb = b.p.couponEligible
      ? b.p.price * 0.85 + b.p.shippingCost
      : b.p.price + b.p.shippingCost;
    return pa - pb;
  });

  return ranked.map((s) => s.p);
}
