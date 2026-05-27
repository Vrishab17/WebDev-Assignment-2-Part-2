"use client";

import type { FormEvent } from "react";
import { drivers } from "@/data/drivers";

type Props = {
  driverId: string;
  setDriverId: (value: string) => void;
  loginDriver: (event: FormEvent<HTMLFormElement>) => void;
};

export default function DriverLogin({
  driverId,
  setDriverId,
  loginDriver,
}: Props) {
  return (
    <section className="card loginCard">
      <h2>Driver Login</h2>
      <form className="form" onSubmit={loginDriver}>
        <label>Driver ID</label>
        <input
          value={driverId}
          onChange={(event) => setDriverId(event.target.value.toUpperCase())}
          placeholder="Example: DRV001"
          list="driverIds"
        />

        <datalist id="driverIds">
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </datalist>

        <button className="primary" type="submit">
          Login
        </button>
      </form>
    </section>
  );
}
