import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { listAdminBookingsPageData } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";
import type { BookingPaymentStatus } from "@/types/booking";

const ADMIN_BOOKING_PAYMENT_STATUSES = new Set<BookingPaymentStatus>([
  "pending",
  "authorized",
  "captured",
  "capture_failed",
  "refunded",
  "failed",
  "authorization_cancelled",
]);

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const searchParams = new URL(request.url).searchParams;
    const page = Number(searchParams.get("page") ?? "1");
    const query = searchParams.get("q") ?? undefined;
    const paymentStatusParam = searchParams.get("paymentStatus");
    const paymentStatus =
      paymentStatusParam && ADMIN_BOOKING_PAYMENT_STATUSES.has(paymentStatusParam as BookingPaymentStatus)
        ? (paymentStatusParam as BookingPaymentStatus)
        : undefined;
    const data = await listAdminBookingsPageData({ page, query, paymentStatus });

    return NextResponse.json(data);
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
