import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import {
  createCarrierConnectAccountLink,
  ensureCarrierStripeAccount,
  getCarrierStripeStateByUserId,
} from "@/lib/stripe/connect";
import { toErrorResponse } from "@/lib/errors";

export async function POST() {
  try {
    const user = await requireSessionUser();
    const carrier = await getCarrierStripeStateByUserId(user.id);
    const accountId = await ensureCarrierStripeAccount({
      carrierId: carrier.id,
      businessName: carrier.business_name,
      contactName: carrier.contact_name,
      email: carrier.email ?? user.email ?? null,
      existingAccountId: carrier.stripe_account_id,
    });
    const link = await createCarrierConnectAccountLink({ accountId });

    return NextResponse.json({ url: link.url, accountId });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
