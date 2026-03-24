import type { BookingStatus } from "@/types/booking";

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "delivered"],
  in_transit: ["delivered"],
  delivered: ["completed", "disputed"],
  completed: ["disputed"],
  cancelled: [],
  disputed: ["completed", "cancelled"],
};

export function canTransitionBooking(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
) {
  return allowedTransitions[currentStatus].includes(nextStatus);
}
