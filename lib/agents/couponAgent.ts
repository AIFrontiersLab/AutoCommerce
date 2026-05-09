import type { CouponFinding, EnrichedProduct } from "../types";

/**
 * CouponAgent — validates promo codes against eligibility rules.
 *
 * Production: affiliate networks, retailer promo APIs, or cart automation via Playwright.
 */
export function runCouponAgent(enriched: EnrichedProduct[]): {
  withCoupons: EnrichedProduct[];
  coupons: CouponFinding[];
  fakeDiscountNotes: string[];
} {
  const coupons: CouponFinding[] = [
    {
      code: "SAVE15",
      description: "15% off eligible SKUs at participating marketplaces (demo)",
      discountPct: 15,
      appliesToProductIds: enriched.filter((p) => p.couponEligible).map((p) => p.id),
    },
  ];

  const fakeDiscountNotes: string[] = [];
  const withCoupons = enriched.map((p) => {
    const eligible = p.couponEligible;
    let appliedCoupons: string[] = [];
    let couponSavings = 0;
    let after = p.estimatedFinalPrice;

    if (eligible) {
      appliedCoupons = ["SAVE15"];
      couponSavings = Math.round(p.price * 0.15 * 100) / 100;
      after = Math.round((p.price - couponSavings + p.shippingCost) * 100) / 100;
    }

    if (p.wasPrice && p.wasPrice > p.price * 1.45) {
      fakeDiscountNotes.push(
        `${p.marketplace}: “was $${p.wasPrice}” looks disconnected from street pricing — flag for manual review.`,
      );
    }

    return {
      ...p,
      appliedCoupons,
      couponSavings,
      estimatedFinalPriceAfterCoupon: after,
      valueScore:
        p.valueScore +
        (eligible ? 6 : 0) -
        (p.wasPrice && p.wasPrice > p.price * 1.45 ? 8 : 0),
      overallScore:
        p.overallScore +
        (eligible ? 4 : 0) -
        (p.wasPrice && p.wasPrice > p.price * 1.45 ? 5 : 0),
    };
  });

  return { withCoupons, coupons, fakeDiscountNotes };
}
