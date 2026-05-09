import type { CopilotRunState, Product } from "./types";
import { runMemoryAgent } from "./agents/memoryAgent";
import { runResearchAgent } from "./agents/researchAgent";
import { runComparisonAgent } from "./agents/comparisonAgent";
import { runTrustAgent } from "./agents/trustAgent";
import { runCouponAgent } from "./agents/couponAgent";
import { runPriceIntelligenceAgent } from "./agents/priceIntelligenceAgent";
import { runNegotiationAgent } from "./agents/negotiationAgent";
import { buildFinalRecommendation } from "./finalRecommendationBuilder";
import { MOCK_CATALOG_ALL } from "./mockProducts";
import { fetchOrganicSearchResults } from "./serpWebSearch";
import { mapSerpOrganicToProducts } from "./webResultsToProducts";

export async function buildCopilotState(userPrompt: string): Promise<CopilotRunState> {
  const memory = runMemoryAgent(userPrompt);
  let catalog: Product[] = [...MOCK_CATALOG_ALL];

  const serp = await fetchOrganicSearchResults(userPrompt);
  const organic = serp.items;
  if (organic.length > 0) {
    const budgetFallback = memory.budgetUsd ?? 2200;
    catalog = [...mapSerpOrganicToProducts(organic, budgetFallback), ...catalog];
  }

  const products = runResearchAgent(userPrompt, memory, catalog);
  if (products.length === 0) {
    return {
      userPrompt,
      memory,
      products: [],
      enriched: [],
      coupons: [],
      final: null,
      negotiations: [],
      fakeDiscountWarnings: [],
      serpOrganicCount: organic.length,
      serpKeyConfigured: serp.keyConfigured,
      serpFetchError: serp.fetchError,
      serpOrganicEmpty: serp.organicEmpty,
    };
  }

  let enriched = runComparisonAgent(products, memory, userPrompt);
  enriched = runTrustAgent(enriched);
  const { withCoupons, coupons, fakeDiscountNotes } = runCouponAgent(enriched);
  enriched = runPriceIntelligenceAgent(withCoupons);
  const negotiations = runNegotiationAgent(enriched, memory);
  const final = buildFinalRecommendation(enriched, userPrompt);

  return {
    userPrompt,
    memory,
    products,
    enriched,
    coupons,
    final,
    negotiations,
    fakeDiscountWarnings: fakeDiscountNotes,
    serpOrganicCount: organic.length,
    serpKeyConfigured: serp.keyConfigured,
    serpFetchError: serp.fetchError,
    serpOrganicEmpty: serp.organicEmpty,
  };
}
