import { z } from "zod";

import { sanitizeText } from "@/lib/utils";

const sanitizedString = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? sanitizeText(value) : value),
    z.string().min(min).max(max),
  );

export const unmatchedRequestSchema = z.object({
  customerId: z.string().uuid().optional(),
  moveRequestId: z.string().uuid().optional(),
  status: z.enum(["active", "notified", "matched", "expired", "cancelled"]).optional(),
  pickupSuburb: sanitizedString(2, 120),
  pickupPostcode: sanitizedString(3, 8).optional(),
  pickupLatitude: z.number().min(-90).max(90),
  pickupLongitude: z.number().min(-180).max(180),
  dropoffSuburb: sanitizedString(2, 120),
  dropoffPostcode: sanitizedString(3, 8).optional(),
  dropoffLatitude: z.number().min(-90).max(90),
  dropoffLongitude: z.number().min(-180).max(180),
  itemCategory: z.enum(["furniture", "boxes", "appliance", "fragile", "other"]).optional(),
  itemDescription: sanitizedString(4, 200),
  preferredDate: z.string().optional(),
  notifyEmail: z.string().email().optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
});

export type UnmatchedRequestInput = z.infer<typeof unmatchedRequestSchema>;
