import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { createFastMatchBookingRequests } from "@/lib/data/booking-requests";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { fastMatchBookingRequestSchema } from "@/lib/validation/booking-request";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const rateLimit = await enforceRateLimit(`fast-match:create:${user.id}`, 4, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Fast Match rate limit reached.", code: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))),
          },
        },
      );
    }

    const payload = fastMatchBookingRequestSchema.parse(await request.json());
    const result = await createFastMatchBookingRequests(user.id, payload);

    await trackAnalyticsEvent({
      eventName: "fast_match_created",
      userId: user.id,
      pathname: "/api/booking-requests/fast-match",
      dedupeKey: `fast_match_created:${result.requestGroupId}`,
      metadata: {
        requestGroupId: result.requestGroupId,
        moveRequestId: result.moveRequest.id,
        requestCount: result.bookingRequests.length,
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
