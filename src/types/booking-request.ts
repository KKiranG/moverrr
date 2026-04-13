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

export type BookingRequestEventActorRole =
  | "customer"
  | "carrier"
  | "admin"
  | "system";

export interface BookingRequestEvent {
  id: string;
  bookingRequestId: string;
  moveRequestId: string;
  requestGroupId?: string | null;
  actorRole: BookingRequestEventActorRole;
  actorUserId?: string | null;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

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
  clarificationRoundCount?: number | null;
  clarificationReason?: BookingRequestClarificationReason | null;
  clarificationRequestedAt?: string | null;
  clarificationExpiresAt?: string | null;
  clarificationMessage?: string | null;
  customerResponse?: string | null;
  customerResponseAt?: string | null;
  respondedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBookingRequestCard {
  id: string;
  moveRequestId: string;
  offerId: string;
  listingId: string;
  bookingId?: string | null;
  requestGroupId?: string | null;
  status: BookingRequestStatus;
  itemDescription: string;
  pickupSuburb: string;
  dropoffSuburb: string;
  requestedTotalPriceCents: number;
  responseDeadlineAt: string;
  preferredDate?: string | null;
  carrierBusinessName: string;
  fitExplanation: string;
  typeLabel: string;
  urgencyLabel?: string | null;
  declineReason?: string | null;
  clarificationReason?: BookingRequestClarificationReason | null;
  clarificationMessage?: string | null;
  clarificationRequestedAt?: string | null;
  clarificationExpiresAt?: string | null;
  customerResponse?: string | null;
  customerResponseAt?: string | null;
  respondedAt?: string | null;
  expiresAt?: string | null;
  recoveryAlertId?: string | null;
  createdAt: string;
}

export interface CustomerRequestGroupSummary {
  requestGroupId: string;
  totalRequests: number;
  winningBookingRequestId?: string | null;
  winningCarrierBusinessName?: string | null;
  liveRequestCount: number;
  revokedCount: number;
  declinedCount: number;
  expiredCount: number;
}
