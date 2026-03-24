import { z } from "zod";

export const disputeSchema = z.object({
  category: z.enum([
    "damage",
    "no_show",
    "late",
    "wrong_item",
    "overcharge",
    "other",
  ]),
  description: z.string().trim().min(10).max(1200),
  photoUrls: z.array(z.string()).max(4).default([]),
});

export type DisputeInput = z.infer<typeof disputeSchema>;
