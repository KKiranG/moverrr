import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { createCustomerPaymentMethodCheckoutSession } from "@/lib/data/customer-payments";
import { toErrorResponse } from "@/lib/errors";

const paymentMethodSessionSchema = z.object({
  returnTo: z.string().trim().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const payload = paymentMethodSessionSchema.parse(await request.json());
    const session = await createCustomerPaymentMethodCheckoutSession({
      userId: user.id,
      returnTo: payload.returnTo,
    });

    return NextResponse.json(session);
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
