import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { getCarrierPayoutLedgerCsv } from "@/lib/data/bookings";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await requireSessionUser();
    const csv = await getCarrierPayoutLedgerCsv(user.id);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="moverrr-payout-ledger.csv"',
      },
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
