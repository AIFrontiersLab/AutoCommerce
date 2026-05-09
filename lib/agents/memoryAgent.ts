import type { NegotiationTone, UserMemorySnapshot } from "../types";

/**
 * MemoryAgent — persists preferences for multi-session personalization.
 *
 * Production: write/read via Supabase (`user_preferences` table) or vector memory.
 * Plug-in: `createServerClient` from `@supabase/ssr` + RLS policies on `profiles`.
 */
export function runMemoryAgent(userPrompt: string): UserMemorySnapshot {
  const lower = userPrompt.toLowerCase();
  let budgetUsd: number | undefined;
  const kBudget = lower.match(/\$?\s*([0-9]+(?:\.[0-9]+)?)\s*k\b/i);
  if (kBudget) {
    budgetUsd = Math.round(parseFloat(kBudget[1]!) * 1000);
  } else {
    const budgetMatch = lower.match(/\$\s*([0-9]{3,4})\b/);
    if (budgetMatch) budgetUsd = parseInt(budgetMatch[1]!, 10);
  }
  const ramMatch = lower.match(/(\d+)\s*gb/);
  const ramGb = ramMatch ? parseInt(ramMatch[1]!, 10) : undefined;

  const chipM = lower.match(/\bm\s*([1-4])\b/i);
  const chipFamily = chipM ? `M${chipM[1]}` : undefined;

  let negotiationTone: NegotiationTone = "friendly";
  if (/\b(aggressive|firm|lowball)\b/i.test(userPrompt)) negotiationTone = "aggressive";
  else if (/\b(professional|formal|business)\b/i.test(userPrompt))
    negotiationTone = "professional";
  else if (/\b(startup|founder|runway)\b/i.test(userPrompt))
    negotiationTone = "startup_founder";
  else if (/\b(luxury|concierge|white glove)\b/i.test(userPrompt))
    negotiationTone = "luxury_buyer";

  const shippingPreference =
    /\bfast|overnight|2[- ]?day\b/i.test(userPrompt) ? "fastest" : "standard";

  const preferredBrands: string[] = [];
  if (lower.includes("apple") || lower.includes("macbook")) preferredBrands.push("Apple");
  if (/\bsony\b/.test(lower)) preferredBrands.push("Sony");
  if (/\bsamsung\b/.test(lower)) preferredBrands.push("Samsung");
  if (/\bdell\b/.test(lower)) preferredBrands.push("Dell");

  return {
    budgetUsd,
    preferredBrands,
    ramGb,
    chipFamily,
    negotiationTone,
    shippingPreference,
  };
}
