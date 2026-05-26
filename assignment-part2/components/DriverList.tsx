"use client";

import { UserCheck } from "lucide-react";
import { drivers } from "@/data/drivers";
import StatusBadge from "@/components/StatusBadge";

export default function DriverList() {
  return (
    <section className="grid four">
      {drivers.map((driver) => (
        <div className="card driver" key={driver.id}>
          <UserCheck size={30} />
          <h3>{driver.name}</h3>
          <p>{driver.id}</p>
          <p>{driver.car}</p>
          <p>{driver.plate}</p>
          <p>{driver.suburb}</p>
          <strong>{driver.rating} ★</strong>
          <StatusBadge value={driver.available ? "available" : "busy"} />
        </div>
      ))}
    </section>
  );
}