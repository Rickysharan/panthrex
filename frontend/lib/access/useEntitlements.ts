"use client";

import { useEffect, useState } from "react";

type Entitlements = {
  tier:
    | "free"
    | "welcome_trial"
    | "day_pass"
    | "premium";

  premium: boolean;

  welcomeTrial: {
    active: boolean;
    used: boolean;
    startedAt: string | null;
    endsAt: string | null;
  };

  dayPass: {
    active: boolean;
    expiresAt: string | null;
  };

  subscription: {
    active: boolean;
    expiresAt: string | null;
  };

  premiumUntil: string | null;
};

type EntitlementsResponse = {
  success: boolean;
  entitlements?: Entitlements;
  error?: string;
};

export function useEntitlements() {
  const [entitlements, setEntitlements] =
    useState<Entitlements | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadEntitlements() {
      try {
        const response = await fetch(
          "/api/entitlements",
          {
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as EntitlementsResponse;

        if (
          !cancelled &&
          data.success &&
          data.entitlements
        ) {
          setEntitlements(
            data.entitlements,
          );
        }
      } catch (error) {
        console.error(
          "Unable to load entitlements",
          error,
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEntitlements();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    entitlements,
    loading,
  };
}
