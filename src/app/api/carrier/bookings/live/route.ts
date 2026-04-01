import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { listCarrierBookings } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const bookings = await listCarrierBookings(user.id);

    return NextResponse.json({ bookings });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
