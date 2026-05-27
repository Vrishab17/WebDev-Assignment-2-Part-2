"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import type { Booking, Driver } from "@/types/cabsonline";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/utils/bookingUtils";

type Props = {
  driver: Driver;
  trips: Booking[];
  updateTrip: (
    bookingRef: string,
    action: "on_way" | "picked_up" | "finish"
  ) => void;
};

export default function DriverDashboard({ driver, trips, updateTrip }: Props) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>{driver.name}</h2>
          <p>
            {driver.id} | {driver.car} | {driver.plate}
          </p>
        </div>
        <StatusBadge value={trips.length > 0 ? "busy" : "available"} />
      </div>

      <div className="tripList">
        {trips.map((trip) => {
          const paymentPending = trip.paymentStatus !== "paid";
          const onTheWay = trip.trackingStep >= 3;

          return (
            <article className="tripCard" key={trip.bookingRef}>
              <div className="sectionHeader">
                <div>
                  <h3>{trip.bookingRef}</h3>
                  <p>{trip.cname}</p>
                </div>
                <StatusBadge value={trip.status} />
              </div>

              <div className="summary driverTripSummary">
                <p>
                  <Phone size={15} /> <strong>Phone:</strong> {trip.phone}
                </p>
                <p>
                  <MapPin size={15} /> <strong>Pickup:</strong>{" "}
                  {trip.pickupAddress}
                </p>
                <p>
                  <MapPin size={15} /> <strong>Destination:</strong>{" "}
                  {trip.destinationAddress}
                </p>
                <p>
                  <Clock size={15} /> <strong>Date/Time:</strong>{" "}
                  {formatDate(trip.date)} {trip.time}
                </p>
                <p>
                  <strong>Payment:</strong> {trip.paymentStatus}
                </p>
                <p>
                  <strong>Tracking Step:</strong> {trip.trackingStep}
                </p>
              </div>

              {paymentPending && (
                <p className="warningText">
                  Customer payment is required before trip progress.
                </p>
              )}

              <div className="actions">
                <button
                  disabled={paymentPending || onTheWay}
                  onClick={() => updateTrip(trip.bookingRef, "on_way")}
                >
                  Confirm On The Way
                </button>
                <button
                  disabled={paymentPending || !onTheWay}
                  onClick={() => updateTrip(trip.bookingRef, "picked_up")}
                >
                  Confirm Picked Up
                </button>
                <button
                  className="danger"
                  disabled={paymentPending || !onTheWay}
                  onClick={() => updateTrip(trip.bookingRef, "finish")}
                >
                  Finish Drive
                </button>
              </div>
            </article>
          );
        })}

        {trips.length === 0 && (
          <div className="empty">
            <p>No upcoming or current trips assigned to this driver.</p>
          </div>
        )}
      </div>
    </section>
  );
}
