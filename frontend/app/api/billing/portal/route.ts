import { NextResponse } from "next/server";

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
        { error: "You must be signed in to manage billing." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    const { data: customer, error: customerError } = await admin
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      throw new Error(customerError.message);
    }

    if (!customer?.stripe_customer_id) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer exists for this account. Subscribe first.",
        },
        { status: 404 },
      );
    }

    const stripe = getStripe();
    const applicationUrl = getApplicationUrl(request);

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: customer.stripe_customer_id,
        return_url: `${applicationUrl}/settings`,
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to open the billing portal.",
      },
      { status: 500 },
    );
  }
}
