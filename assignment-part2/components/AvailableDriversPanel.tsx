"use client";

import { UserCheck } from "lucide-react";
import type { Booking } from "@/types/cabsonline";
import StatusBadge from "@/components/StatusBadge";
import { getDriversWithAvailability } from "@/utils/driverUtils";

export default function AvailableDriversPanel({
  bookings,
}: {
  bookings: Booking[];
}) {
  const drivers = getDriversWithAvailability(bookings);

  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Available Drivers</h2>
          <p>Availability is calculated from assigned trips in the next hour.</p>
        </div>
      </div>

      <div className="driverStatusGrid">
        {drivers.map((driver) => (
          <div className="driverStatus" key={driver.id}>
            <UserCheck size={24} />
            <div>
              <h3>{driver.name}</h3>
              <p>{driver.id}</p>
              <p>{driver.car}</p>
              <p>{driver.plate}</p>
              <p>{driver.suburb}</p>
            </div>
            <StatusBadge value={driver.busy ? "busy" : "available"} />
          </div>
        ))}
      </div>
    </section>
  );
}
