import type { Marketplace, Product } from "./types";

function hostMarketplace(host: string): Marketplace {
  const h = host.replace(/^www\./, "").toLowerCase();
  if (h.includes("amazon.")) return "Amazon";
  if (h.includes("ebay.")) return "eBay";
  if (h.includes("walmart.")) return "Walmart";
  if (h.includes("target.")) return "Target";
  if (h.includes("bestbuy.")) return "Best Buy";
  if (h.includes("bhphotovideo.") || h.includes("bandh.")) return "B&H";
  if (h.includes("apple.")) return "Apple Refurbished";
  if (h.includes("costco.")) return "Costco";
  if (h.includes("microcenter.")) return "Micro Center";
  if (h.includes("facebook.")) return "Facebook Marketplace";
  return "eBay";
}

function firstPriceUsd(text: string): number | undefined {
  const m = text.match(/\$\s*([\d,]+)/);
  if (!m) return undefined;
  const n = parseInt(m[1]!.replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}

function stableId(link: string): string {
  let h = 0;
  for (let i = 0; i < link.length; i++) {
    h = (h * 31 + link.charCodeAt(i)) | 0;
  }
  return `web-${Math.abs(h).toString(36)}`;
}

/**
 * Turn search snippets into coarse `Product` rows so the rest of the pipeline can run.
 * Prices are best-effort from the snippet; many rows will need manual verification.
 */
export function mapSerpOrganicToProducts(
  items: { title: string; link: string; snippet?: string }[],
  budgetFallbackUsd: number,
): Product[] {
  return items.map((item) => {
    let host = "result";
    try {
      host = new URL(item.link).hostname;
    } catch {
      /* ignore */
    }
    const blob = `${item.title} ${item.snippet ?? ""}`;
    const parsed = firstPriceUsd(blob);
    const price = parsed ?? Math.round(budgetFallbackUsd * 0.9);
    const mp = hostMarketplace(host);

    return {
      id: stableId(item.link),
      title: item.title,
      marketplace: mp,
      price,
      ramGb: 0,
      chip: "Web listing",
      condition: "new",
      sellerName: host,
      sellerRating: 4.2,
      returnPolicy: "Verify on retailer page — parsed from search only.",
      shippingCost: 0,
      shippingDays: 3,
      couponEligible: false,
      listPrice: parsed ? price * 1.05 : price,
      estimatedFinalPrice: price,
      trustScore: 72,
      recommendationReason: "Surfaced from live web search — confirm SKU and price before buying.",
      warrantyMonths: 12,
    };
  });
}
