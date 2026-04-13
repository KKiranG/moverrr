import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { getMoveRequestByIdForCustomer } from "@/lib/data/move-requests";
import { deriveOffersForMoveRequest, listOffersForMoveRequest } from "@/lib/data/offers";
import { requireCustomerProfileForUser } from "@/lib/data/profiles";
import { AppError, toErrorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const moveRequestId = searchParams.get("moveRequestId");

    if (!moveRequestId) {
      throw new AppError("moveRequestId is required.", 400, "missing_move_request_id");
    }

    const customer = await requireCustomerProfileForUser(user.id);
    const moveRequest = await getMoveRequestByIdForCustomer(customer.id, moveRequestId);

    if (!moveRequest) {
      throw new AppError("Move request not found.", 404, "move_request_not_found");
    }

    const persistedOffers = await listOffersForMoveRequest(moveRequest.id);
    const offers =
      persistedOffers.length > 0
        ? persistedOffers
        : await deriveOffersForMoveRequest(moveRequest);

    return NextResponse.json({
      moveRequest,
      offers,
      source: persistedOffers.length > 0 ? "persisted" : "derived",
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(
      { error: response.message, code: response.code },
      { status: response.statusCode },
    );
  }
}
