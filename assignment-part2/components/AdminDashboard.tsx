"use client";

import { Search } from "lucide-react";
import { drivers } from "@/data/drivers";
import type { Booking } from "@/types/cabsonline";
import { formatDate } from "@/utils/bookingUtils";
import StatusBadge from "@/components/StatusBadge";

type Props = {
  bookings: Booking[];
  adminSearch: string;
  setAdminSearch: (value: string) => void;
  assignDriver: (bookingRef: string, driverId: string) => void;
  clearDemoData: () => void;
};

export default function AdminDashboard({
  bookings,
  adminSearch,
  setAdminSearch,
  assignDriver,
  clearDemoData,
}: Props) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Search active bookings and assign drivers.</p>
        </div>

        <button className="danger" onClick={clearDemoData}>
          Clear Demo Data
        </button>
      </div>

      <div className="searchBox">
        <Search size={18} />
        <input
          placeholder="Search by booking reference, e.g. BRN00001"
          value={adminSearch}
          onChange={(event) => setAdminSearch(event.target.value)}
        />
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Pickup</th>
              <th>Destination</th>
              <th>Date/Time</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Driver</th>
              <th>Assign</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.bookingRef}>
                <td>{booking.bookingRef}</td>
                <td>{booking.cname}</td>
                <td>{booking.phone}</td>
                <td>{booking.sbname}</td>
                <td>{booking.dsbname}</td>
                <td>
                  {formatDate(booking.date)} {booking.time}
                </td>
                <td>
                  <StatusBadge value={booking.status} />
                </td>
                <td>{booking.paymentStatus}</td>
                <td>{booking.driverName || "Not assigned"}</td>
                <td>
                  <select
                    disabled={booking.status !== "unassigned"}
                    defaultValue=""
                    onChange={(event) =>
                      assignDriver(booking.bookingRef, event.target.value)
                    }
                  >
                    <option value="">Assign</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={10}>No active bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}