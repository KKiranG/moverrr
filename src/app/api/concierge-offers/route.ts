import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminUser } from "@/lib/auth";
import { createConciergeOffer } from "@/lib/data/concierge-offers";
import { toErrorResponse } from "@/lib/errors";

const conciergeOfferSchema = z.object({
  unmatchedRequestId: z.string().uuid(),
  carrierId: z.string().uuid(),
  quotedTotalPriceCents: z.number().int().positive(),
  note: z.string().trim().max(280).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser();
    const payload = conciergeOfferSchema.parse(await request.json());
    const conciergeOffer = await createConciergeOffer({
      adminUserId: user.id,
      unmatchedRequestId: payload.unmatchedRequestId,
      carrierId: payload.carrierId,
      quotedTotalPriceCents: payload.quotedTotalPriceCents,
      note: payload.note,
    });

    return NextResponse.json({ conciergeOffer });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
