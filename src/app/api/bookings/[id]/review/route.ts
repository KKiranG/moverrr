import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { createReviewForBooking } from "@/lib/data/feedback";
import { toErrorResponse } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireSessionUser();
    const payload = (await request.json()) as {
      rating: number;
      comment?: string;
    };
    const review = await createReviewForBooking(user.id, params.id, payload);

    return NextResponse.json({ review });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
