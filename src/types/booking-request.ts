export type BookingRequestStatus =
  | "pending"
  | "clarification_requested"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked"
  | "cancelled";

export type BookingRequestClarificationReason =
  | "item_details"
  | "access_details"
  | "timing"
  | "photos"
  | "other";

export interface BookingRequest {
  id: string;
  moveRequestId: string;
  offerId: string;
  listingId: string;
  customerId: string;
  carrierId: string;
  bookingId?: string | null;
  requestGroupId?: string | null;
  status: BookingRequestStatus;
  requestedTotalPriceCents: number;
  responseDeadlineAt: string;
  clarificationReason?: BookingRequestClarificationReason | null;
  clarificationMessage?: string | null;
  customerResponse?: string | null;
  respondedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
