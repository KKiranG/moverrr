import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { createDisputeForBooking } from "@/lib/data/feedback";
import { toErrorResponse } from "@/lib/errors";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireSessionUser();
    const payload = (await request.json()) as {
      category: "damage" | "no_show" | "late" | "wrong_item" | "overcharge" | "other";
      description: string;
      photoUrls?: string[];
    };
    const dispute = await createDisputeForBooking(user.id, params.id, {
      category: payload.category,
      description: payload.description,
      photoUrls: payload.photoUrls ?? [],
    });

    return NextResponse.json({ dispute });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
