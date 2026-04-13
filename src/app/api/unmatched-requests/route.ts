import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { requireCustomerProfileForUser } from "@/lib/data/profiles";
import { createUnmatchedRequest } from "@/lib/data/unmatched-requests";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { unmatchedRequestSchema } from "@/lib/validation/unmatched-request";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const rateLimit = await enforceRateLimit(`unmatched-request:create:${user.id}`, 10, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Alert request rate limit reached.", code: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))),
          },
        },
      );
    }

    const payload = unmatchedRequestSchema.parse(await request.json());
    const customer = await requireCustomerProfileForUser(user.id);
    const unmatchedRequest = await createUnmatchedRequest({
      ...payload,
      customerId: customer.id,
      notifyEmail: payload.notifyEmail ?? user.email ?? undefined,
      status: payload.status ?? "active",
    });

    await trackAnalyticsEvent({
      eventName: "unmatched_request_created",
      userId: user.id,
      pathname: "/api/unmatched-requests",
      dedupeKey: `unmatched_request_created:${unmatchedRequest.id}`,
      metadata: {
        unmatchedRequestId: unmatchedRequest.id,
        moveRequestId: unmatchedRequest.moveRequestId ?? null,
      },
    });

    return NextResponse.json({ unmatchedRequest });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
