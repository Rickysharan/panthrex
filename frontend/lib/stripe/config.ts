export type BillingInterval = "month" | "year";

export type PlanId = "free" | "pro" | "day_pass";

export type BillingPlan = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  oneTimePriceId?: string;
  features: string[];
};

export const billingPlans: Record<PlanId, BillingPlan> = {
  free: {
    id: "free",
    name: "Free",
    description: "Core career tools for getting started.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    monthlyPriceId: "",
    yearlyPriceId: "",
    features: [
      "1 active resume",
      "5 AI generations per month",
      "3 ATS scans per month",
      "Basic job tracking",
    ],
  },

  day_pass: {
    id: "day_pass",
    name: "Day Pass",
    description: "24 hours of unlimited Panthrex Premium access.",
    monthlyPrice: 0.99,
    yearlyPrice: 0,
    monthlyPriceId: "",
    yearlyPriceId: "",
    oneTimePriceId:
      process.env.NEXT_PUBLIC_STRIPE_DAY_PASS_PRICE_ID ?? "",
    features: [
      "24 hours of unlimited Premium access",
      "Unlimited AI generations",
      "Unlimited ATS scans",
      "Resume tailoring",
      "Interview preparation",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro",
    description: "Advanced AI tools for serious job seekers.",
    monthlyPrice: 12.99,
    yearlyPrice: 99.99,
    monthlyPriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
    yearlyPriceId:
      process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? "",
    features: [
      "Unlimited resumes",
      "100 AI generations per month",
      "Unlimited ATS scans",
      "AI resume tailoring",
      "Advanced interview preparation",
      "Priority support",
    ],
  },
};

export function getStripePriceId(
  planId: PlanId,
  interval: BillingInterval,
): string {
  const plan = billingPlans[planId];

  const priceId =
    interval === "year" ? plan.yearlyPriceId : plan.monthlyPriceId;

  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for ${planId} ${interval} billing.`,
    );
  }

  return priceId;
}
