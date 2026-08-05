export interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  maxStores: number;
  maxSkus: number;
  features: string[];
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    maxStores: 1,
    maxSkus: 50,
    features: ["360° panorama", "Basic search", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 99,
    priceYearly: 999,
    maxStores: 5,
    maxSkus: 500,
    features: [
      "Photogrammetry mesh",
      "AI guide",
      "Retail media",
      "Analytics dashboard",
      "Priority support",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 499,
    priceYearly: 4999,
    maxStores: 999,
    maxSkus: 999999,
    features: [
      "Unlimited stores & SKUs",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA",
    ],
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function canAddProduct(currentSkuCount: number, planId: string): boolean {
  const plan = getPlan(planId);
  return currentSkuCount < plan.maxSkus;
}

export function canCreateStore(currentStoreCount: number, planId: string): boolean {
  const plan = getPlan(planId);
  return currentStoreCount < plan.maxStores;
}

export function getStripePriceId(planId: string, billingCycle: "monthly" | "yearly"): string | undefined {
  const plan = getPlan(planId);
  return billingCycle === "yearly" ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly;
}
