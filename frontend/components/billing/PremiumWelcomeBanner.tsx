"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

import PremiumCountdown from "@/components/billing/PremiumCountdown";

type PremiumWelcomeBannerProps = {
  tier:
    | "welcome_trial"
    | "day_pass"
    | "premium";

  expiry: string | null;
};

export default function PremiumWelcomeBanner({
  tier,
  expiry,
}: PremiumWelcomeBannerProps) {
  const storageKey =
    "panthrex-premium-banner-dismissed";

  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return (
      localStorage.getItem(storageKey) !== "true"
    );
  });

  if (!visible) {
    return null;
  }

  function dismiss() {
    localStorage.setItem(
      storageKey,
      "true",
    );

    setVisible(false);
  }

  const title =
    tier === "day_pass"
      ? "⚡ 24-Hour Premium Access Activated"
      : tier === "welcome_trial"
        ? "🎁 Welcome to Panthrex Premium"
        : "🟣 Panthrex Pro Activated";

  return (
    <div className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-blue-500/10 p-6">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-4 top-4 rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
        aria-label="Dismiss premium banner"
      >
        <X size={18} />
      </button>

      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
          <Sparkles size={24} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm text-white/55">
            Unlock powerful AI career tools:
          </p>

          <ul className="mt-3 space-y-1 text-sm text-white/70">
            <li>✓ AI Resume Writer</li>
            <li>✓ ATS Score Optimisation</li>
            <li>✓ Job Matching</li>
            <li>✓ Interview Preparation</li>
          </ul>

          {expiry && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Premium expires in
              </p>

              <PremiumCountdown expiry={expiry} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
