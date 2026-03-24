import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { verifyCarrier } from "@/lib/data/carriers";
import { toErrorResponse } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await requireAdminUser();
    const payload = (await request.json()) as {
      isApproved: boolean;
      notes?: string;
    };
    const carrier = await verifyCarrier({
      carrierId: params.id,
      isApproved: payload.isApproved,
      notes: payload.notes,
    });

    return NextResponse.json({ carrier });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
