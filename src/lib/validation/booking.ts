import { z } from "zod";

export const bookingSchema = z.object({
  listingId: z.string().uuid(),
  carrierId: z.string().uuid(),
  itemDescription: z.string().min(4).max(200),
  itemCategory: z.enum(["furniture", "boxes", "appliance", "fragile", "other"]),
  itemDimensions: z.string().max(120).optional(),
  itemWeightKg: z.number().min(0).max(500).optional(),
  itemPhotoUrls: z.array(z.string().min(1)).default([]),
  needsStairs: z.boolean().default(false),
  needsHelper: z.boolean().default(false),
  specialInstructions: z.string().max(280).optional(),
  pickupAddress: z.string().min(8).max(160),
  pickupSuburb: z.string().min(2).max(120),
  pickupPostcode: z.string().min(4).max(8),
  pickupLatitude: z.number().min(-90).max(90),
  pickupLongitude: z.number().min(-180).max(180),
  dropoffAddress: z.string().min(8).max(160),
  dropoffSuburb: z.string().min(2).max(120),
  dropoffPostcode: z.string().min(4).max(8),
  dropoffLatitude: z.number().min(-90).max(90),
  dropoffLongitude: z.number().min(-180).max(180),
  pickupAccessNotes: z.string().max(240).optional(),
  dropoffAccessNotes: z.string().max(240).optional(),
  pickupContactName: z.string().max(120).optional(),
  pickupContactPhone: z.string().max(24).optional(),
  dropoffContactName: z.string().max(120).optional(),
  dropoffContactPhone: z.string().max(24).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
