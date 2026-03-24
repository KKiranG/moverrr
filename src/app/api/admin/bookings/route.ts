import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { listAdminBookings } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
    const bookings = await listAdminBookings({ page });

    return NextResponse.json({ bookings });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
