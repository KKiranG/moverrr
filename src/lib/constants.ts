import type { ItemCategory, SpaceSize } from "@/types/trip";

export const BOOKING_FEE_CENTS = 500;
export const PLATFORM_COMMISSION_RATE = 0.15;
export const SEARCH_PAGE_SIZE = 20;
export const ADMIN_PAGE_SIZE = 25;
export const SEARCH_REVALIDATE_SECONDS = 30;

export const DEFAULT_DEDICATED_ESTIMATES: Record<SpaceSize, number> = {
  S: 9000,
  M: 14000,
  L: 20000,
  XL: 30000,
};

export const ITEM_CATEGORIES: ItemCategory[] = [
  "furniture",
  "boxes",
  "appliance",
  "fragile",
  "other",
];

export const PRIVATE_BUCKETS = {
  carrierDocuments: "carrier-documents",
  vehiclePhotos: "vehicle-photos",
  itemPhotos: "item-photos",
  proofPhotos: "proof-photos",
} as const;
