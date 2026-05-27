import type { Booking, BookingStatus, PaymentStatus } from "@/types/cabsonline";

type BookingRow = {
  booking_ref: string;
  cname: string;
  phone: string;
  unumber?: string | null;
  snumber?: string | null;
  stname?: string | null;
  pickup_address?: string | null;
  destination_address?: string | null;
  sbname?: string | null;
  dsbname?: string | null;
  pickup_lat?: number | null;
  pickup_lon?: number | null;
  destination_lat?: number | null;
  destination_lon?: number | null;
  pickup_date: string;
  pickup_time?: string | null;
  payment_method?: string | null;
  status?: BookingStatus | null;
  payment_status?: PaymentStatus | null;
  driver_id?: string | null;
  driver_name?: string | null;
  driver_car?: string | null;
  driver_plate?: string | null;
  booking_datetime?: string | null;
  estimated_fare?: number | string | null;
  tracking_step?: number | null;
};

export function dbToBooking(row: BookingRow): Booking {
  return {
    bookingRef: row.booking_ref,
    cname: row.cname,
    phone: row.phone,
    unumber: row.unumber || "",
    snumber: row.snumber || "",
    stname: row.stname || "",
    pickupAddress: row.pickup_address || "",
    destinationAddress: row.destination_address || "",
    sbname: row.sbname || "",
    dsbname: row.dsbname || "",
    pickupLat: row.pickup_lat ?? undefined,
    pickupLon: row.pickup_lon ?? undefined,
    destinationLat: row.destination_lat ?? undefined,
    destinationLon: row.destination_lon ?? undefined,
    date: row.pickup_date,
    time: row.pickup_time?.slice(0, 5) || "",
    paymentMethod: row.payment_method || "Card",
    status: row.status || "unassigned",
    paymentStatus: row.payment_status || "pending",
    driverId: row.driver_id || "",
    driverName: row.driver_name || "",
    driverCar: row.driver_car || "",
    driverPlate: row.driver_plate || "",
    bookingCreated: row.booking_datetime || "",
    estimatedFare: Number(row.estimated_fare || 0),
    trackingStep: row.tracking_step || 1,
  };
}

export function isElapsedBooking(booking: Booking) {
  const pickupDateTime = new Date(`${booking.date}T${booking.time}`);
  return pickupDateTime < new Date();
}

export function getActiveBookings(bookings: Booking[]) {
  return bookings.filter(
    (booking) => booking.status !== "completed" && !isElapsedBooking(booking)
  );
}

export function filterAdminBookings(bookings: Booking[], search: string) {
  const activeBookings = getActiveBookings(bookings);
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return activeBookings;

  return activeBookings.filter((booking) =>
    booking.bookingRef.toLowerCase().includes(normalizedSearch)
  );
}

export function getDriverTrips(driverId: string, bookings: Booking[]) {
  return getActiveBookings(bookings).filter(
    (booking) => booking.driverId === driverId && booking.status === "assigned"
  );
}
