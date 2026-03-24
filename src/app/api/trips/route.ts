import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { createTripForCarrier, listCarrierTrips } from "@/lib/data/trips";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const trips = await listCarrierTrips(user.id);

    return NextResponse.json({ trips });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const payload = await request.json();
    const trip = await createTripForCarrier(user.id, payload);

    return NextResponse.json({ trip });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
