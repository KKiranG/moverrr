import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { createPaymentIntentForBooking } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";
import { getStripePublishableKey } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const payload = (await request.json()) as { bookingId: string };
    const intent = await createPaymentIntentForBooking(user.id, payload.bookingId);

    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      publishableKey: getStripePublishableKey(),
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
