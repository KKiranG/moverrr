import Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe/client";

export function verifyStripeWebhookSignature(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET.");
  }

  return getStripeServerClient().webhooks.constructEvent(
    payload,
    signature,
    webhookSecret,
  );
}

export function isPaymentIntentEvent(event: Stripe.Event) {
  return event.type.startsWith("payment_intent.");
}
