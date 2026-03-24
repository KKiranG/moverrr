export type DisputeCategory =
  | "damage"
  | "no_show"
  | "late"
  | "wrong_item"
  | "overcharge"
  | "other";

export type DisputeStatus = "open" | "investigating" | "resolved" | "closed";

export interface Dispute {
  id: string;
  bookingId: string;
  raisedBy: "customer" | "carrier";
  raiserId: string;
  category: DisputeCategory;
  description: string;
  photoUrls: string[];
  status: DisputeStatus;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}
