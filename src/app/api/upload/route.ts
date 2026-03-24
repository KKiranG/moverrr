import { NextResponse, type NextRequest } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { PRIVATE_BUCKETS } from "@/lib/constants";
import { toErrorResponse, AppError } from "@/lib/errors";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  createSignedPrivateUrl,
  type PrivateBucketName,
  uploadPrivateFile,
} from "@/lib/storage";

const allowedBuckets = Object.values(PRIVATE_BUCKETS) as PrivateBucketName[];

function isPrivateBucketName(value: string): value is PrivateBucketName {
  return allowedBuckets.includes(value as PrivateBucketName);
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireSessionUser();
    const rateLimit = enforceRateLimit(`upload:${user.id}`, 20, 60_000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Upload rate limit reached." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const bucket = formData.get("bucket");

    if (!(file instanceof File)) {
      throw new AppError("A file is required.", 400, "file_required");
    }

    if (typeof bucket !== "string" || !isPrivateBucketName(bucket)) {
      throw new AppError("A valid upload bucket is required.", 400, "bucket_required");
    }

    const safeBucket = bucket;
    const path = `${user.id}/${Date.now()}-${file.name}`;
    await uploadPrivateFile({
      bucket: safeBucket,
      path,
      file,
    });
    const signedUrl = await createSignedPrivateUrl({ bucket: safeBucket, path });

    return NextResponse.json({ bucket: safeBucket, path, signedUrl });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json({ error: response.message }, { status: response.statusCode });
  }
}
