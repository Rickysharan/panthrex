import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Add it to .env.local before using Stripe.",
    );
  }

  stripeClient = new Stripe(secretKey, {
    appInfo: {
      name: "Panthrex",
      version: "1.0.0",
    },
  });

  return stripeClient;
}
