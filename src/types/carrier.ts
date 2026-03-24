export type VerificationStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "rejected";

export type VehicleType =
  | "van"
  | "ute"
  | "small_truck"
  | "large_truck"
  | "trailer";

export interface CarrierProfile {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  abn?: string;
  bio?: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string | null;
  verifiedAt?: string | null;
  verificationNotes?: string | null;
  averageRating: number;
  ratingCount: number;
  serviceSuburbs: string[];
  stripeAccountId?: string | null;
  stripeOnboardingComplete: boolean;
  onboardingCompletedAt?: string | null;
}

export interface Vehicle {
  id: string;
  carrierId: string;
  type: VehicleType;
  make?: string;
  model?: string;
  maxVolumeM3: number;
  maxWeightKg: number;
  hasTailgate: boolean;
  hasBlankets: boolean;
  hasStraps: boolean;
  photoUrls: string[];
  regoPlate?: string | null;
  regoState?: string | null;
  isActive: boolean;
}
