import { z } from "zod";

const categorySet = z.enum([
  "furniture",
  "boxes",
  "appliance",
  "fragile",
  "other",
]);

export const tripSchema = z.object({
  originSuburb: z.string().min(2).max(120),
  originPostcode: z.string().min(4).max(8),
  originLatitude: z.number().min(-90).max(90),
  originLongitude: z.number().min(-180).max(180),
  destinationSuburb: z.string().min(2).max(120),
  destinationPostcode: z.string().min(4).max(8),
  destinationLatitude: z.number().min(-90).max(90),
  destinationLongitude: z.number().min(-180).max(180),
  detourRadiusKm: z.number().min(0).max(30),
  tripDate: z.string().min(1),
  timeWindow: z.enum(["morning", "afternoon", "evening", "flexible"]),
  spaceSize: z.enum(["S", "M", "L", "XL"]),
  availableVolumeM3: z.number().min(0.1).max(8),
  availableWeightKg: z.number().min(20).max(500),
  priceCents: z.number().min(1000).max(100000),
  suggestedPriceCents: z.number().min(1000).max(100000).optional(),
  accepts: z.array(categorySet).min(1),
  stairsOk: z.boolean().default(false),
  stairsExtraCents: z.number().min(0).default(0),
  helperAvailable: z.boolean().default(false),
  helperExtraCents: z.number().min(0).default(0),
  status: z.enum(["draft", "active"]).default("active"),
  specialNotes: z.string().max(280).optional(),
});

export const tripUpdateSchema = z.object({
  tripDate: z.string().min(1),
  timeWindow: z.enum(["morning", "afternoon", "evening", "flexible"]),
  spaceSize: z.enum(["S", "M", "L", "XL"]),
  availableVolumeM3: z.number().min(0.1).max(8),
  availableWeightKg: z.number().min(20).max(500),
  detourRadiusKm: z.number().min(0).max(30),
  priceCents: z.number().min(1000).max(100000),
  status: z.enum(["draft", "active", "cancelled"]),
  specialNotes: z.string().max(280).optional(),
});

export type TripInput = z.infer<typeof tripSchema>;
export type TripUpdateInput = z.infer<typeof tripUpdateSchema>;
