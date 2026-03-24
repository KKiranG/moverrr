import { NextResponse, type NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth";
import { listAdminCarriers } from "@/lib/data/carriers";
import { toErrorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
    const carriers = await listAdminCarriers({ page });

    return NextResponse.json({ carriers });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
