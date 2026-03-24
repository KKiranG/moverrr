import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { getValidationMetrics } from "@/lib/data/admin";
import { bootstrapSmokeDataset } from "@/lib/data/bootstrap";
import { toErrorResponse } from "@/lib/errors";

export async function GET() {
  try {
    await requireAdminUser();
    const metrics = await getValidationMetrics();

    return NextResponse.json({ metrics });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser();
    const payload = (await request.json()) as { action: "bootstrap"; secret: string };

    if (payload.action !== "bootstrap") {
      return NextResponse.json({ error: "Unsupported admin action." }, { status: 400 });
    }

    const result = await bootstrapSmokeDataset(payload.secret);
    return NextResponse.json({ result });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
