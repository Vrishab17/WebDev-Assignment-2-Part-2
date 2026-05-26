"use client";

import { AlertCircle, Clock, Search } from "lucide-react";
import type { Booking } from "@/types/cabsonline";

type Props = {
  trackingSearch: string;
  setTrackingSearch: (value: string) => void;
  trackingBooking: Booking | null;
  progressTracking: (bookingRef: string) => void;
};

export default function TrackingPanel({
  trackingSearch,
  setTrackingSearch,
  trackingBooking,
  progressTracking,
}: Props) {
  return (
    <div className="card">
      <h2>Customer Booking Tracking</h2>
      <p>Enter a booking reference number to monitor the taxi request.</p>

      <div className="searchBox">
        <Search size={18} />
        <input
          placeholder="Example: BRN00001"
          value={trackingSearch}
          onChange={(event) => setTrackingSearch(event.target.value)}
        />
      </div>

      {trackingBooking ? (
        <TrackingCard
          booking={trackingBooking}
          onProgress={progressTracking}
        />
      ) : (
        <div className="empty">
          <AlertCircle />
          <p>No booking selected or no matching booking found.</p>
        </div>
      )}
    </div>
  );
}

function TrackingCard({
  booking,
  onProgress,
}: {
  booking: Booking;
  onProgress: (bookingRef: string) => void;
}) {
  const steps = [
    "Booking received",
    "Driver assigned",
    "Driver on the way",
    "Trip completed",
  ];

  return (
    <div className="tracking">
      <h3>{booking.bookingRef}</h3>
      <p>{booking.cname}</p>
      <p>
        {booking.sbname} → {booking.dsbname}
      </p>

      <div className="timeline">
        {steps.map((step, index) => (
          <div
            className={index + 1 <= booking.trackingStep ? "step done" : "step"}
            key={step}
          >
            <Clock size={16} />
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="summary">
        <p>
          <strong>Driver:</strong> {booking.driverName || "Not assigned"}
        </p>
        <p>
          <strong>Vehicle:</strong> {booking.driverCar || "Not available"}
        </p>
        <p>
          <strong>Plate:</strong> {booking.driverPlate || "Not available"}
        </p>
        <p>
          <strong>Payment:</strong> {booking.paymentStatus}
        </p>
      </div>

      <button
        className="primary"
        disabled={booking.trackingStep >= 4}
        onClick={() => onProgress(booking.bookingRef)}
      >
        Progress Tracking Demo
      </button>
    </div>
  );
}