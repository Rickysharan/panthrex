import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AccessTier =
  | "free"
  | "welcome_trial"
  | "day_pass"
  | "premium";

export type Entitlements = {
  tier: AccessTier;
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

function isFuture(value: string | null): boolean {
  if (!value) return false;

  return new Date(value).getTime() > Date.now();
}

function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const ownerEmails =
    process.env.PANTHREX_OWNER_EMAILS
      ?.split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean) ?? [];

  return ownerEmails.includes(email.trim().toLowerCase());
}

function createOwnerEntitlements(): Entitlements {
  return {
    tier: "premium",
    premium: true,

    welcomeTrial: {
      active: false,
      used: false,
      startedAt: null,
      endsAt: null,
    },

    dayPass: {
      active: false,
      expiresAt: null,
    },

    subscription: {
      active: true,
      expiresAt: null,
    },

    premiumUntil: null,
  };
}

export async function getEntitlements(): Promise<Entitlements> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      tier: "free",
      premium: false,

      welcomeTrial: {
        active: false,
        used: false,
        startedAt: null,
        endsAt: null,
      },

      dayPass: {
        active: false,
        expiresAt: null,
      },

      subscription: {
        active: false,
        expiresAt: null,
      },

      premiumUntil: null,
    };
  }

  if (isOwnerEmail(user.email)) {
    return createOwnerEntitlements();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      welcome_trial_used,
      welcome_trial_started_at,
      welcome_trial_ends_at,
      premium_until
    `)
    .eq("id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select(`
      status,
      current_period_end
    `)
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"])
    .maybeSingle();

  const welcomeActive = isFuture(
    profile?.welcome_trial_ends_at ?? null,
  );

  const premiumUntilActive = isFuture(
    profile?.premium_until ?? null,
  );

  const subscriptionActive =
    !!subscription &&
    isFuture(subscription.current_period_end);

  let tier: AccessTier = "free";

  if (subscriptionActive) {
    tier = "premium";
  } else if (welcomeActive) {
    tier = "welcome_trial";
  } else if (premiumUntilActive) {
    tier = "day_pass";
  }

  return {
    tier,

    premium:
      subscriptionActive ||
      premiumUntilActive ||
      welcomeActive,

    welcomeTrial: {
      active: welcomeActive,
      used: profile?.welcome_trial_used ?? false,
      startedAt:
        profile?.welcome_trial_started_at ?? null,
      endsAt:
        profile?.welcome_trial_ends_at ?? null,
    },

    dayPass: {
      active: premiumUntilActive,
      expiresAt:
        profile?.premium_until ?? null,
    },

    subscription: {
      active: subscriptionActive,
      expiresAt:
        subscription?.current_period_end ?? null,
    },

    premiumUntil:
      profile?.premium_until ?? null,
  };
}