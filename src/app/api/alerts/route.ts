import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { createRouteAlert, listUserAlertsWithOptions } from "@/lib/data/alerts";
import { toErrorResponse } from "@/lib/errors";

const alertCreateSchema = z.object({
  fromSuburb: z.string().trim().min(2).max(120),
  fromPostcode: z.string().trim().min(3).max(8).optional(),
  toSuburb: z.string().trim().min(2).max(120),
  toPostcode: z.string().trim().min(3).max(8).optional(),
  itemCategory: z.string().trim().min(1).max(40).optional(),
  dateFrom: z.string().trim().min(1).optional(),
  dateTo: z.string().trim().min(1).optional(),
  notifyEmail: z.string().email().optional(),
});

export async function GET() {
  try {
    const user = await requireSessionUser();
    const alerts = await listUserAlertsWithOptions(user.id, {
      includeInactive: true,
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const body = alertCreateSchema.parse(await request.json());
    const alert = await createRouteAlert(user.id, {
      ...body,
      notifyEmail: body.notifyEmail ?? user.email ?? "",
    });

    return NextResponse.json({ alert });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
