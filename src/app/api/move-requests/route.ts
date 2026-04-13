import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { createMoveRequest } from "@/lib/data/move-requests";
import { requireCustomerProfileForUser } from "@/lib/data/profiles";
import { toErrorResponse } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import { moveRequestSchema } from "@/lib/validation/move-request";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const rateLimit = await enforceRateLimit(`move-request:create:${user.id}`, 8, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Move request rate limit reached.", code: "rate_limited" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil(rateLimit.retryAfterMs / 1000))),
          },
        },
      );
    }

    const payload = moveRequestSchema.parse(await request.json());
    const customer = await requireCustomerProfileForUser(user.id);
    const moveRequest = await createMoveRequest(customer.id, {
      ...payload,
      status: payload.status ?? "submitted",
    });

    await trackAnalyticsEvent({
      eventName: "move_request_created",
      userId: user.id,
      pathname: "/api/move-requests",
      dedupeKey: `move_request_created:${moveRequest.id}`,
      metadata: {
        moveRequestId: moveRequest.id,
        itemCategory: moveRequest.item.category,
        preferredDate: moveRequest.route.preferredDate ?? null,
      },
    });

    return NextResponse.json({ moveRequest });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
