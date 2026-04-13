import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { createRequestToBook } from "@/lib/data/booking-requests";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { bookingRequestCreateSchema } from "@/lib/validation/booking-request";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const rateLimit = await enforceRateLimit(`booking-request:create:${user.id}`, 6, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Booking request rate limit reached.", code: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))),
          },
        },
      );
    }

    const payload = bookingRequestCreateSchema.parse(await request.json());
    const result = await createRequestToBook(user.id, payload);

    await trackAnalyticsEvent({
      eventName: "booking_request_created",
      userId: user.id,
      pathname: "/api/booking-requests",
      dedupeKey: `booking_request_created:${result.bookingRequest.id}`,
      metadata: {
        bookingRequestId: result.bookingRequest.id,
        moveRequestId: result.bookingRequest.moveRequestId,
        offerId: result.bookingRequest.offerId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
