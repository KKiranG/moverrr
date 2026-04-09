import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { createPaymentIntentForBooking } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";
import { getStripePublishableKey } from "@/lib/stripe/client";

const createIntentSchema = z.object({
  bookingId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const payload = createIntentSchema.parse(await request.json());
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
