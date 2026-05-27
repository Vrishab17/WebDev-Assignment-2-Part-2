"use client";

import { UserCheck } from "lucide-react";
import { drivers } from "@/data/drivers";
import type { Booking } from "@/types/cabsonline";
import StatusBadge from "@/components/StatusBadge";
import { isDriverBusyWithinNextHour } from "@/utils/driverUtils";

export default function DriverList({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="grid four">
      {drivers.map((driver) => {
        const busy = isDriverBusyWithinNextHour(driver.id, bookings);

        return (
          <div className="card driver" key={driver.id}>
            <UserCheck size={30} />
            <h3>{driver.name}</h3>
            <p>{driver.id}</p>
            <p>{driver.car}</p>
            <p>{driver.plate}</p>
            <p>{driver.suburb}</p>
            <strong>{driver.rating} ★</strong>
            <StatusBadge value={busy ? "busy" : "available"} />
          </div>
        );
      })}
    </section>
  );
}
