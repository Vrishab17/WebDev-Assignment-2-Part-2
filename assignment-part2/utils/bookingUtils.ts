import type { Booking } from "@/types/cabsonline";
import { suburbs } from "@/data/suburbs";

export function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function getCurrentTime() {
  return new Date().toTimeString().slice(0, 5);
}

export function generateBookingReference(bookings: Booking[]) {
  if (bookings.length === 0) return "BRN00001";

  const highest = bookings.reduce((max, booking) => {
    const number = Number(booking.bookingRef.replace("BRN", ""));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return "BRN" + String(highest + 1).padStart(5, "0");
}

export function estimateFare(from: string, to: string) {
  if (from === to) return 18;

  const fromIndex = suburbs.indexOf(from);
  const toIndex = suburbs.indexOf(to);
  const distance = Math.abs(fromIndex - toIndex) + 1;

  return 12 + distance * 4;
}

export function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-NZ");
}
