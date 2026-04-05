import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import {
  getBookingActorRoleForUser,
  logBookingExceptionForActor,
} from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";
import type { BookingExceptionCode } from "@/types/booking";

const bookingExceptionCodeValues = [
  "damage",
  "no_show",
  "late",
  "wrong_item",
  "overcharge",
  "other",
] satisfies Exclude<BookingExceptionCode, "none">[];

const bookingExceptionSchema = z.object({
  code: z.enum(bookingExceptionCodeValues),
  note: z.string().trim().min(1),
  photoUrls: z.array(z.string().min(1)).default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = bookingExceptionSchema.parse(await request.json());
    const user = await requireSessionUser();
    const actorRole = await getBookingActorRoleForUser(user.id, params.id);
    const exception = await logBookingExceptionForActor({
      userId: user.id,
      bookingId: params.id,
      actorRole,
      code: payload.code,
      note: payload.note,
      photoUrls: payload.photoUrls,
    });

    return NextResponse.json({ exception });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
