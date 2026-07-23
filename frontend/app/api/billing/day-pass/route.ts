import { NextResponse } from "next/server";

import { billingPlans } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

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
        { error: "You must be signed in to purchase a Day Pass." },
        { status: 401 },
      );
    }

    const stripe = getStripe();
    const admin = createAdminClient();

    const dayPassPriceId = billingPlans.day_pass.oneTimePriceId;

    if (!dayPassPriceId) {
      throw new Error("Missing Stripe Day Pass price ID.");
    }

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
        mode: "payment",
        customer: stripeCustomerId,
        client_reference_id: user.id,
        line_items: [
          {
            price: dayPassPriceId,
            quantity: 1,
          },
        ],
        success_url:
          `${applicationUrl}/settings?billing=day-pass-success` +
          "&session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          `${applicationUrl}/settings?billing=day-pass-cancelled`,
        metadata: {
          supabase_user_id: user.id,
          purchase_type: "day_pass",
        },
        payment_intent_data: {
          metadata: {
            supabase_user_id: user.id,
            purchase_type: "day_pass",
          },
        },
      });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a Day Pass checkout URL.");
    }

    const { error: dayPassInsertError } = await admin
      .from("day_passes")
      .insert({
        user_id: user.id,
        stripe_checkout_session_id: checkoutSession.id,
        amount_paid: 99,
        currency: "gbp",
        status: "pending",
      });

    if (dayPassInsertError) {
      throw new Error(dayPassInsertError.message);
    }

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe Day Pass checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Day Pass checkout session.",
      },
      { status: 500 },
    );
  }
}
