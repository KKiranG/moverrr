import { NextResponse, type NextRequest } from "next/server";

import { autoReleaseDeliveredBookings } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET ?? process.env.VERCEL_CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const releasedBookingIds = await autoReleaseDeliveredBookings();

    return NextResponse.json({
      releasedBookingIds,
      releasedCount: releasedBookingIds.length,
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
