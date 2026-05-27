import type { Booking } from "@/types/cabsonline";
import { drivers } from "@/data/drivers";

export function isDriverBusyWithinNextHour(
  driverId: string,
  bookings: Booking[]
) {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return bookings.some((booking) => {
    if (booking.driverId !== driverId) return false;
    if (booking.status !== "assigned") return false;

    const pickupDateTime = new Date(`${booking.date}T${booking.time}`);

    return pickupDateTime >= now && pickupDateTime <= oneHourLater;
  });
}

export function getDriversWithAvailability(bookings: Booking[]) {
  return drivers.map((driver) => ({
    ...driver,
    busy: isDriverBusyWithinNextHour(driver.id, bookings),
  }));
}

export function getAvailableDrivers(bookings: Booking[]) {
  return getDriversWithAvailability(bookings).filter((driver) => !driver.busy);
}
