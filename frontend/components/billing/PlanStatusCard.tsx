"use client";

import Link from "next/link";

import PremiumCountdown from "@/components/billing/PremiumCountdown";

type PlanStatusCardProps = {
  entitlements: {
    tier:
      | "free"
      | "welcome_trial"
      | "day_pass"
      | "premium";

    premium: boolean;

    premiumUntil: string | null;

    subscription: {
      active: boolean;
      expiresAt: string | null;
    };

    welcomeTrial: {
      active: boolean;
      endsAt: string | null;
    };

    dayPass: {
      active: boolean;
      expiresAt: string | null;
    };
  } | null;
};

export default function PlanStatusCard({
  entitlements,
}: PlanStatusCardProps) {
  if (!entitlements) {
    return null;
  }

  if (entitlements.subscription.active) {
    return (
      <div className="mb-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
        <p className="text-sm font-semibold text-indigo-200">
          🟣 Panthrex Pro
        </p>

        <p className="mt-1 text-xs text-white/45">
          Premium AI features unlocked.
        </p>

        {entitlements.subscription.expiresAt && (
          <p className="mt-2 text-xs text-white/50">
            Renews on:
            <span className="ml-1 font-semibold text-indigo-300">
              {new Date(
                entitlements.subscription.expiresAt,
              ).toLocaleDateString("en-GB")}
            </span>
          </p>
        )}

        <Link
          href="/settings"
          className="mt-3 block rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-semibold hover:bg-white/20"
        >
          Manage subscription
        </Link>
      </div>
    );
  }

  if (entitlements.dayPass.active) {
    return (
      <div className="mb-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
        <p className="text-sm font-semibold text-indigo-200">
          ⚡ 1-Day Premium Access
        </p>

        <PremiumCountdown
          expiry={
            entitlements.dayPass.expiresAt
          }
        />
      </div>
    );
  }

  if (entitlements.welcomeTrial.active) {
    return (
      <div className="mb-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
        <p className="text-sm font-semibold text-indigo-200">
          🎁 Welcome Trial
        </p>

        <PremiumCountdown
          expiry={
            entitlements.welcomeTrial.endsAt
          }
        />
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-4">
      <p className="text-sm font-semibold text-indigo-200">
        Panthrex Pro
      </p>

      <p className="mt-1 text-xs text-white/45">
        Unlock unlimited AI career tools.
      </p>

      <Link
        href="/#pricing"
        className="mt-3 block rounded-xl bg-indigo-500 px-3 py-2 text-center text-xs font-semibold"
      >
        Upgrade now
      </Link>
    </div>
  );
}
