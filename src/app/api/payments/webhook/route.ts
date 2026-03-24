import Stripe from "stripe";
import { NextResponse } from "next/server";

import { verifyStripeWebhookSignature } from "@/lib/stripe/webhooks";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimit = enforceRateLimit("stripe-webhook", 120, 60_000);

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Webhook throttled." }, { status: 429 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  try {
    const body = await request.text();
    const event = verifyStripeWebhookSignature(body, signature);

    if (event.type.startsWith("payment_intent.")) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (bookingId) {
        const supabase = createAdminClient();

        if (event.type === "payment_intent.payment_failed") {
          await supabase
            .from("bookings")
            .update({ payment_status: "failed" })
            .eq("id", bookingId);
        }

        if (
          event.type === "payment_intent.amount_capturable_updated" ||
          event.type === "payment_intent.succeeded"
        ) {
          await supabase
            .from("bookings")
            .update({ payment_status: "authorized" })
            .eq("id", bookingId);
        }
      }
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook verification failed.",
      },
      { status: 400 },
    );
  }
}
