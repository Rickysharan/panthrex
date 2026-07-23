"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";

type BillingInterval = "month" | "year";

type PlanName = "Free" | "Day Pass" | "Pro" | "Teams";

type Plan = {
  name: PlanName;
  price: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  featured: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "£0",
    description: "Perfect for getting started.",
    features: [
      "Basic Resume Builder",
      "5 AI Resume Optimizations / month",
      "Job Search",
      "Application Tracker",
    ],
    featured: false,
  },
  {
    name: "Day Pass",
    price: "£0.99",
    priceSuffix: " / 24 hours",
    description: "Unlock Panthrex Premium for one full day.",
    features: [
      "24 hours of Premium access",
      "Unlimited AI Resume Optimization",
      "Unlimited Cover Letters",
      "ATS Resume Score",
      "AI Interview Coach",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "£9.99",
    priceSuffix: " / month",
    description: "Everything needed to land interviews.",
    features: [
      "Unlimited AI Resume Optimization",
      "Unlimited Cover Letters",
      "AI Interview Coach",
      "ATS Resume Score",
      "Application Analytics",
      "Priority Support",
    ],
    featured: true,
  },
  {
    name: "Teams",
    price: "Custom",
    description: "Universities and career centres.",
    features: [
      "Student Dashboard",
      "Admin Analytics",
      "Bulk User Management",
      "Institution Branding",
    ],
    featured: false,
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] =
    useState<PlanName | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startSubscriptionCheckout(
    interval: BillingInterval,
  ) {
    setLoadingPlan("Pro");
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interval }),
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (response.status === 401) {
        window.location.href = "/login?next=%2F%23pricing";
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to start subscription checkout.",
        );
      }

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start subscription checkout.",
      );
      setLoadingPlan(null);
    }
  }

  async function startDayPassCheckout() {
    setLoadingPlan("Day Pass");
    setError(null);

    try {
      const response = await fetch("/api/billing/day-pass", {
        method: "POST",
      });

      const result = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (response.status === 401) {
        window.location.href = "/login?next=%2F%23pricing";
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to start Day Pass checkout.",
        );
      }

      if (!result.url) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start Day Pass checkout.",
      );
      setLoadingPlan(null);
    }
  }

  function handlePlanAction(planName: PlanName) {
    if (planName === "Day Pass") {
      void startDayPassCheckout();
      return;
    }

    if (planName === "Pro") {
      void startSubscriptionCheckout("month");
      return;
    }

    if (planName === "Free") {
      window.location.href = "/signup";
      return;
    }

    window.location.href =
      "mailto:support@panthrex.com?subject=Panthrex%20Teams%20Enquiry";
  }

  function getButtonLabel(planName: PlanName, isLoading: boolean) {
    if (isLoading) {
      return "Opening checkout...";
    }

    if (planName === "Day Pass") {
      return "Get Day Pass";
    }

    if (planName === "Pro") {
      return "Start Pro";
    }

    if (planName === "Teams") {
      return "Contact Sales";
    }

    return "Get Started";
  }

  return (
    <section
      id="pricing"
      className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
    >
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
          Pricing
        </p>

        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          Simple pricing
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Start for free, unlock Premium for a day, or upgrade to
          Pro.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isLoading = loadingPlan === plan.name;

          return (
            <div
              key={plan.name}
              className={`rounded-3xl border p-8 transition ${
                plan.featured
                  ? "border-violet-500 bg-violet-500/10 xl:scale-105"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p className="mt-2 min-h-12 text-white/60">
                {plan.description}
              </p>

              <div className="mt-6 text-5xl font-bold">
                {plan.price}

                {plan.priceSuffix && (
                  <span className="text-lg text-white/60">
                    {plan.priceSuffix}
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <Check
                      size={18}
                      className="shrink-0 text-green-400"
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handlePlanAction(plan.name)}
                disabled={loadingPlan !== null}
                className={`mt-10 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  plan.featured
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {isLoading && (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                )}

                {getButtonLabel(plan.name, isLoading)}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200"
        >
          {error}
        </div>
      )}
    </section>
  );
}
