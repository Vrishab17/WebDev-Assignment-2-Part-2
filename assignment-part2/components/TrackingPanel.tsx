"use client";

import { AlertCircle, Clock, CreditCard, Search } from "lucide-react";
import type { Booking } from "@/types/cabsonline";
import StatusBadge from "@/components/StatusBadge";

type Props = {
  trackingSearch: string;
  setTrackingSearch: (value: string) => void;
  trackingBooking: Booking | null;
  progressTracking: (bookingRef: string) => void;
  processPayment: (bookingRef: string) => void;
};

export default function TrackingPanel({
  trackingSearch,
  setTrackingSearch,
  trackingBooking,
  progressTracking,
  processPayment,
}: Props) {
  return (
    <div className="card">
      <h2>Customer Booking Tracking</h2>
      <p>Enter a booking reference number to monitor and pay for your trip.</p>

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
          onPay={processPayment}
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
  onPay,
}: {
  booking: Booking;
  onProgress: (bookingRef: string) => void;
  onPay: (bookingRef: string) => void;
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

      <div className="summary">
        <p>
          <strong>Status:</strong> <StatusBadge value={booking.status} />
        </p>
        <p>
          <strong>Payment:</strong> {booking.paymentStatus}
        </p>
        <p>
          <strong>Estimated Fare:</strong> ${booking.estimatedFare} NZD
        </p>
        <p>
          <strong>Driver:</strong> {booking.driverName || "Not assigned"}
        </p>
        <p>
          <strong>Vehicle:</strong> {booking.driverCar || "Not available"}
        </p>
        <p>
          <strong>Plate:</strong> {booking.driverPlate || "Not available"}
        </p>
      </div>

      {booking.paymentStatus !== "paid" && (
        <button
          className="primary paymentButton"
          onClick={() => onPay(booking.bookingRef)}
        >
          <CreditCard size={18} />
          Pay Now
        </button>
      )}

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

      <button
        className="primary"
        disabled={
          booking.status === "completed" ||
          booking.status === "unassigned" ||
          booking.paymentStatus !== "paid"
        }
        onClick={() => onProgress(booking.bookingRef)}
      >
        {booking.trackingStep < 3
          ? "Set Driver On The Way"
          : booking.trackingStep < 4
          ? "Complete Trip"
          : "Trip Completed"}
      </button>
    </div>
  );
}