import { NextResponse } from "next/server";

import {
  getStripePriceId,
  type BillingInterval,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CheckoutRequest = {
  interval?: BillingInterval;
};

function isBillingInterval(
  value: unknown,
): value is BillingInterval {
  return value === "month" || value === "year";
}

function getApplicationUrl(request: Request): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe." },
        { status: 401 },
      );
    }

    let body: CheckoutRequest;

    try {
      body = (await request.json()) as CheckoutRequest;
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    if (!isBillingInterval(body.interval)) {
      return NextResponse.json(
        { error: "Billing interval must be month or year." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const admin = createAdminClient();
    const priceId = getStripePriceId("pro", body.interval);

    const { data: profile, error: profileLookupError } = await admin
      .from("profiles")
      .select("stripe_trial_used")
      .eq("id", user.id)
      .single();

    if (profileLookupError) {
      throw new Error(profileLookupError.message);
    }

    const stripeTrialUsed = profile.stripe_trial_used ?? false;

    const { data: existingCustomer, error: customerLookupError } =
      await admin
        .from("customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (customerLookupError) {
      throw new Error(customerLookupError.message);
    }

    let stripeCustomerId = existingCustomer?.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      const { error: customerInsertError } = await admin
        .from("customers")
        .upsert(
          {
            user_id: user.id,
            stripe_customer_id: customer.id,
          },
          {
            onConflict: "user_id",
          },
        );

      if (customerInsertError) {
        throw new Error(customerInsertError.message);
      }
    }

    const applicationUrl = getApplicationUrl(request);

    const checkoutSession =
      await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        client_reference_id: user.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        success_url:
          `${applicationUrl}/settings?billing=success` +
          "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url: `${applicationUrl}/settings?billing=cancelled`,
        metadata: {
          supabase_user_id: user.id,
          plan: "pro",
          interval: body.interval,
        },
        subscription_data: {
          ...(stripeTrialUsed ? {} : { trial_period_days: 3 }),
          metadata: {
            supabase_user_id: user.id,
            plan: "pro",
          },
        },
      });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create checkout session.",
      },
      { status: 500 },
    );
  }
}
