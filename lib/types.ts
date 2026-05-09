/**
 * Shared domain types for the Autonomous Commerce Copilot.
 * Marketplace adapters (Amazon, eBay, etc.) would normalize into `Product`.
 */

export type Marketplace =
  | "Amazon"
  | "Best Buy"
  | "Costco"
  | "eBay"
  | "B&H"
  | "Apple Refurbished"
  | "Micro Center"
  | "Walmart"
  | "Target"
  | "Facebook Marketplace";

export type ProductCondition = "new" | "refurbished" | "open_box" | "used";

export type NegotiationTone =
  | "professional"
  | "friendly"
  | "aggressive"
  | "startup_founder"
  | "luxury_buyer";

export interface Product {
  id: string;
  title: string;
  marketplace: Marketplace;
  price: number;
  ramGb: number;
  chip: string;
  condition: ProductCondition;
  sellerName: string;
  sellerRating: number;
  returnPolicy: string;
  shippingCost: number;
  shippingDays: number;
  couponEligible: boolean;
  /** List price before coupon; UI may show strikethrough "was" price for scam detection */
  listPrice?: number;
  wasPrice?: number;
  estimatedFinalPrice: number;
  trustScore: number;
  recommendationReason: string;
  warrantyMonths: number;
}

export interface EnrichedProduct extends Product {
  appliedCoupons: string[];
  couponSavings: number;
  estimatedFinalPriceAfterCoupon: number;
  specMatchScore: number;
  shippingScore: number;
  valueScore: number;
  overallScore: number;
  trustNarrative: string;
  scamRisk: "low" | "medium" | "high";
  priceConfidence: number;
  predictedPriceChange30dPct: number;
}

export type ActivityStatus = "pending" | "running" | "complete" | "warning";

export interface AgentActivityStep {
  id: string;
  label: string;
  status: ActivityStatus;
  detail?: string;
  agent?: string;
}

export interface UserMemorySnapshot {
  budgetUsd?: number;
  preferredBrands: string[];
  ramGb?: number;
  chipFamily?: string;
  negotiationTone: NegotiationTone;
  shippingPreference: "fastest" | "cheapest" | "standard";
}

export interface CouponFinding {
  code: string;
  description: string;
  discountPct: number;
  appliesToProductIds: string[];
}

export interface FinalRecommendation {
  bestOverall: EnrichedProduct;
  cheapest: EnrichedProduct;
  safestSeller: EnrichedProduct;
  bestRefurb: EnrichedProduct;
  bestNegotiationTarget: EnrichedProduct;
  aiSummary: string;
  priceConfidence: number;
}

export interface NegotiationDraft {
  tone: NegotiationTone;
  message: string;
  targetPriceUsd: number;
  acceptanceProbabilityPct: number;
}

export interface CopilotRunState {
  userPrompt: string;
  memory: UserMemorySnapshot;
  products: Product[];
  enriched: EnrichedProduct[];
  coupons: CouponFinding[];
  final: FinalRecommendation | null;
  negotiations: NegotiationDraft[];
  fakeDiscountWarnings: string[];
  /** Google organic rows merged into the catalog this run (requires SERPAPI_API_KEY on the server). */
  serpOrganicCount: number;
  /** Whether the server saw a non-empty SerpApi key after trim (see SERPAPI_API_KEY or SERP_API_KEY). */
  serpKeyConfigured: boolean;
  /** SerpApi or network error for this run; null when the request succeeded or the key was not set. */
  serpFetchError: string | null;
  /** SerpApi succeeded but returned no organic rows we could parse (optional signal for debugging). */
  serpOrganicEmpty: boolean;
}

export interface BrowserAutomationFrame {
  id: string;
  title: string;
  url: string;
  status: "idle" | "loading" | "complete";
  logLine?: string;
}
