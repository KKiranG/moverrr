import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { resolveDispute } from "@/lib/data/admin";
import { toErrorResponse } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAdminUser();
    const payload = (await request.json()) as {
      status: "investigating" | "resolved" | "closed";
      resolutionNotes?: string;
      bookingStatus?: "completed" | "cancelled";
    };

    const dispute = await resolveDispute({
      disputeId: params.id,
      resolvedBy: user.id,
      status: payload.status,
      resolutionNotes: payload.resolutionNotes ?? "",
      bookingStatus: payload.bookingStatus,
    });

    return NextResponse.json({ dispute });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
