import type { ItemCategory } from "@/types/trip";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed";

export interface BookingPriceBreakdown {
  basePriceCents: number;
  stairsFeeCents: number;
  helperFeeCents: number;
  bookingFeeCents: number;
  totalPriceCents: number;
  carrierPayoutCents: number;
  platformCommissionCents: number;
}

export interface BookingEvent {
  id: string;
  bookingId: string;
  eventType: string;
  actorRole: string;
  actorUserId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Booking {
  id: string;
  listingId: string;
  carrierId: string;
  customerId: string;
  itemDescription: string;
  itemCategory: ItemCategory;
  itemDimensions?: string | null;
  itemWeightKg?: number | null;
  itemPhotoUrls: string[];
  pickupAddress: string;
  pickupSuburb?: string;
  pickupPostcode?: string;
  dropoffAddress: string;
  dropoffSuburb?: string;
  dropoffPostcode?: string;
  pickupAccessNotes?: string | null;
  dropoffAccessNotes?: string | null;
  needsStairs: boolean;
  needsHelper: boolean;
  status: BookingStatus;
  pricing: BookingPriceBreakdown;
  paymentStatus?: "pending" | "authorized" | "captured" | "refunded" | "failed";
  stripePaymentIntentId?: string | null;
  pickupProofPhotoUrl?: string | null;
  deliveryProofPhotoUrl?: string | null;
  customerConfirmedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  events?: BookingEvent[];
}
