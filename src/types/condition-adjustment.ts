export type ConditionAdjustmentReasonCode =
  | "stairs_mismatch"
  | "helper_required"
  | "item_materially_different"
  | "extreme_parking";

export type ConditionAdjustmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "cancelled";

export interface ConditionAdjustment {
  id: string;
  bookingId: string;
  carrierId: string;
  customerId: string;
  reasonCode: ConditionAdjustmentReasonCode;
  amountCents: number;
  status: ConditionAdjustmentStatus;
  note?: string | null;
  customerResponseNote?: string | null;
  responseDeadlineAt: string;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
