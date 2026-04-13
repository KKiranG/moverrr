import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { applyCarrierBookingRequestAction } from "@/lib/data/booking-requests";
import { toErrorResponse } from "@/lib/errors";
import { bookingRequestActionSchema } from "@/lib/validation/booking-request";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const user = await requireSessionUser();
    const payload = bookingRequestActionSchema.parse(await request.json());
    const result = await applyCarrierBookingRequestAction(user.id, context.params.id, payload);

    await trackAnalyticsEvent({
      eventName: "booking_request_action_applied",
      userId: user.id,
      pathname: `/api/booking-requests/${context.params.id}`,
      dedupeKey: `booking_request_action:${result.bookingRequest.id}:${payload.action}:${result.bookingRequest.updatedAt}`,
      metadata: {
        bookingRequestId: result.bookingRequest.id,
        action: payload.action,
        bookingId: result.booking?.id ?? null,
        requestGroupId: result.bookingRequest.requestGroupId ?? null,
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
