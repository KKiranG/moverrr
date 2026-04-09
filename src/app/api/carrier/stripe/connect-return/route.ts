import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { getCarrierStripeStateByUserId, syncCarrierStripeOnboardingStatus } from "@/lib/stripe/connect";
import { getAppUrl } from "@/lib/env";
import { toErrorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const carrier = await getCarrierStripeStateByUserId(user.id);

    if (!carrier.stripe_account_id) {
      return NextResponse.redirect(new URL("/carrier/onboarding?connect=missing", getAppUrl()));
    }

    const result = await syncCarrierStripeOnboardingStatus({
      carrierId: carrier.id,
      accountId: carrier.stripe_account_id,
    });

    const target = result.onboardingComplete
      ? "/carrier/payouts?connect=complete"
      : "/carrier/onboarding?connect=incomplete";
    return NextResponse.redirect(new URL(target, request.url));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
