import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { updateBookingStatusForActor } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireSessionUser();
    const booking = await updateBookingStatusForActor({
      userId: user.id,
      bookingId: params.id,
      nextStatus: "completed",
      actorRole: "customer",
    });

    return NextResponse.json({ booking });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
