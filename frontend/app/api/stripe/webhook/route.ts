import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unixToIso(timestamp: number | null | undefined) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer,
) {
  return typeof customer === "string" ? customer : customer.id;
}

function subscriptionGrantsProAccess(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing";
}

async function findUserId(
  stripeCustomerId: string,
  metadataUserId?: string,
) {
  if (metadataUserId) {
    return metadataUserId;
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.user_id ?? null;
}

async function updateProfileSubscription(
  userId: string,
  plan: "free" | "pro",
  status: string,
) {
  const admin = createAdminClient();

  const profileUpdate: {
    subscription_plan: "free" | "pro";
    subscription_status: string;
    updated_at: string;
    stripe_trial_used?: boolean;
  } = {
    subscription_plan: plan,
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === "trialing") {
    profileUpdate.stripe_trial_used = true;
  }

  const { error } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const admin = createAdminClient();
  const stripeCustomerId = getCustomerId(subscription.customer);

  const userId = await findUserId(
    stripeCustomerId,
    subscription.metadata.supabase_user_id,
  );

  if (!userId) {
    throw new Error(
      `No Supabase user found for Stripe customer ${stripeCustomerId}.`,
    );
  }

  const subscriptionItem = subscription.items.data[0];
  const stripePriceId = subscriptionItem?.price.id ?? null;

  const { error: customerError } = await admin
    .from("customers")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (customerError) {
    throw new Error(customerError.message);
  }

  const { error: subscriptionError } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        stripe_price_id: stripePriceId,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: unixToIso(
          subscriptionItem?.current_period_start,
        ),
        current_period_end: unixToIso(
          subscriptionItem?.current_period_end,
        ),
        trial_start: unixToIso(subscription.trial_start),
        trial_end: unixToIso(subscription.trial_end),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "stripe_subscription_id",
      },
    );

  if (subscriptionError) {
    throw new Error(subscriptionError.message);
  }

  await updateProfileSubscription(
    userId,
    subscriptionGrantsProAccess(subscription.status) ? "pro" : "free",
    subscription.status,
  );
}

async function syncCheckoutSession(
  checkoutSession: Stripe.Checkout.Session,
) {
  const userId =
    checkoutSession.client_reference_id ??
    checkoutSession.metadata?.supabase_user_id;

  const stripeCustomerId =
    typeof checkoutSession.customer === "string"
      ? checkoutSession.customer
      : checkoutSession.customer?.id;

  if (!userId || !stripeCustomerId) {
    return;
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("customers")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  if (checkoutSession.metadata?.purchase_type === "day_pass") {
    const admin = createAdminClient();

    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { error: dayPassError } = await admin
      .from("day_passes")
      .update({
        stripe_payment_intent_id:
          typeof checkoutSession.payment_intent === "string"
            ? checkoutSession.payment_intent
            : null,
        status: "active",
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq(
        "stripe_checkout_session_id",
        checkoutSession.id,
      );

    if (dayPassError) {
      throw new Error(dayPassError.message);
    }

    const { error: profileError } = await admin
      .from("profiles")
      .update({
        premium_until: expires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    return;
  }

  if (typeof checkoutSession.subscription === "string") {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(
      checkoutSession.subscription,
    );

    await syncSubscription(subscription);
  }
}

async function markCustomerPaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.customer) {
    return;
  }

  const stripeCustomerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer.id;

  const userId = await findUserId(stripeCustomerId);

  if (!userId) {
    return;
  }

  await updateProfileSubscription(userId, "free", "past_due");
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET.");

    return NextResponse.json(
      { error: "Webhook configuration is incomplete." },
      { status: 500 },
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        await syncCheckoutSession(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        await syncSubscription(
          event.data.object as Stripe.Subscription,
        );
        break;
      }

      case "invoice.payment_failed": {
        await markCustomerPaymentFailed(
          event.data.object as Stripe.Invoice,
        );
        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(`Stripe webhook processing failed: ${event.type}`, error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}
