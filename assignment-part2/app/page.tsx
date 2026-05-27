"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Car, CheckCircle } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import TrackingPanel from "@/components/TrackingPanel";
import DriverList from "@/components/DriverList";
import MapPanel from "@/components/MapPanel";
import type { Booking } from "@/types/cabsonline";
import { supabase } from "@/lib/supabaseClient";
import { dbToBooking } from "@/utils/bookingFilters";
import {
  estimateFare,
  formatDate,
  generateBookingReference,
  getCurrentTime,
  getToday,
} from "@/utils/bookingUtils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("booking");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [trackingSearch, setTrackingSearch] = useState("");

  const [form, setForm] = useState({
    cname: "",
    phone: "",
    unumber: "",
    snumber: "",
    stname: "",
    sbname: "",
    dsbname: "",
    pickupAddress: "",
    destinationAddress: "",
    pickupLat: undefined as number | undefined,
    pickupLon: undefined as number | undefined,
    destinationLat: undefined as number | undefined,
    destinationLon: undefined as number | undefined,
    date: getToday(),
    time: getCurrentTime(),
    paymentMethod: "Card",
  });

  async function loadBookingsFromSupabase() {
    const { data, error } = await supabase
      .from("cabsonline_bookings")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setBookings((data || []).map(dbToBooking));
  }

  useEffect(() => {
    loadBookingsFromSupabase();
  }, []);

  const trackingBooking = useMemo(() => {
    if (!trackingSearch.trim()) return null;

    return (
      bookings.find(
        (booking) =>
          booking.bookingRef.toLowerCase() === trackingSearch.toLowerCase()
      ) || null
    );
  }, [bookings, trackingSearch]);

  function updateForm(field: string, value: string | number | undefined) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateBooking() {
    if (
      form.cname.trim() === "" ||
      form.phone.trim() === "" ||
      form.pickupAddress.trim() === "" ||
      form.destinationAddress.trim() === ""
    ) {
      return "Please fill in customer name, phone, pickup address, and destination address.";
    }

    if (!/^[0-9]{10,12}$/.test(form.phone)) {
      return "Phone number must contain only numbers and be 10 to 12 digits long.";
    }

    const pickupDateTime = new Date(`${form.date}T${form.time}`);

    if (pickupDateTime < new Date()) {
      return "Pickup date and time must not be earlier than now.";
    }

    return "";
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateBooking();

    if (error) {
      setMessage(error);
      return;
    }

    const bookingRef = generateBookingReference(bookings);
    const fare = estimateFare(form.sbname, form.dsbname);

    const { error: insertError } = await supabase
      .from("cabsonline_bookings")
      .insert({
        booking_ref: bookingRef,
        cname: form.cname,
        phone: form.phone,
        unumber: form.unumber,
        snumber: form.snumber,
        stname: form.stname,
        sbname: form.sbname,
        dsbname: form.dsbname,
        pickup_address: form.pickupAddress,
        destination_address: form.destinationAddress,
        pickup_lat: form.pickupLat,
        pickup_lon: form.pickupLon,
        destination_lat: form.destinationLat,
        destination_lon: form.destinationLon,
        pickup_date: form.date,
        pickup_time: form.time,
        status: "unassigned",
        payment_status: "pending",
        payment_method: form.paymentMethod,
        estimated_fare: fare,
        tracking_step: 1,
      });

    if (insertError) {
      console.error(insertError);
      setMessage(insertError.message);
      return;
    }

    setTrackingSearch(bookingRef);
    setMessage(
      `Thank you for your booking! Booking reference number: ${bookingRef}. Pickup time: ${form.time}. Pickup date: ${formatDate(form.date)}.`
    );

    setForm({
      cname: "",
      phone: "",
      unumber: "",
      snumber: "",
      stname: "",
      sbname: "",
      dsbname: "",
      pickupAddress: "",
      destinationAddress: "",
      pickupLat: undefined,
      pickupLon: undefined,
      destinationLat: undefined,
      destinationLon: undefined,
      date: getToday(),
      time: getCurrentTime(),
      paymentMethod: "Card",
    });

    await loadBookingsFromSupabase();
  }

  async function processPayment(bookingRef: string) {
    const { error } = await supabase
      .from("cabsonline_bookings")
      .update({
        payment_status: "paid",
      })
      .eq("booking_ref", bookingRef);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage(`Payment for booking ${bookingRef} has been completed.`);
    await loadBookingsFromSupabase();
  }

  async function progressTracking(bookingRef: string) {
    const booking = bookings.find((item) => item.bookingRef === bookingRef);

    if (!booking) return;

    if (booking.status === "unassigned") {
      setMessage("A driver must be assigned before the trip can progress.");
      return;
    }

    if (booking.paymentStatus !== "paid") {
      setMessage("Payment must be completed before the driver can go on the way.");
      return;
    }

    const nextStep = Math.min(4, booking.trackingStep + 1);

    const { error } = await supabase
      .from("cabsonline_bookings")
      .update({
        tracking_step: nextStep,
        status: nextStep >= 4 ? "completed" : "assigned",
      })
      .eq("booking_ref", bookingRef);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    if (nextStep === 3) {
      setMessage(`Driver is now on the way for booking ${bookingRef}.`);
    } else if (nextStep === 4) {
      setMessage(`Trip for booking ${bookingRef} has been completed.`);
    }

    await loadBookingsFromSupabase();
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">CabsOnline Part 2</p>
          <h1>Modern Taxi Booking System</h1>
          <p>
            A standalone Next.js taxi booking system with Supabase database,
            real NZ address search, map-based interaction, driver assignment,
            customer tracking, and customer-side payment simulation.
          </p>
          <div className="heroActions">
            <Link className="linkButton" href="/admin">
              Admin Login
            </Link>
            <Link className="linkButton secondary" href="/driver">
              Driver Login
            </Link>
          </div>
        </div>

        <div className="heroCard">
          <Car size={36} />
          <strong>{bookings.length}</strong>
          <span>Total Bookings</span>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === "booking" ? "active" : ""}
          onClick={() => setActiveTab("booking")}
        >
          Booking
        </button>

        <button
          className={activeTab === "tracking" ? "active" : ""}
          onClick={() => setActiveTab("tracking")}
        >
          Customer Tracking
        </button>

        <button
          className={activeTab === "drivers" ? "active" : ""}
          onClick={() => setActiveTab("drivers")}
        >
          Drivers
        </button>
      </nav>

      {message && (
        <div className="message">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {activeTab === "booking" && (
        <section className="grid two">
          <BookingForm
            form={form}
            updateForm={updateForm}
            submitBooking={submitBooking}
          />

          <MapPanel
            pickupLat={form.pickupLat}
            pickupLon={form.pickupLon}
            destinationLat={form.destinationLat}
            destinationLon={form.destinationLon}
          />
        </section>
      )}

      {activeTab === "tracking" && (
        <section className="grid two">
          <TrackingPanel
            trackingSearch={trackingSearch}
            setTrackingSearch={setTrackingSearch}
            trackingBooking={trackingBooking}
            progressTracking={progressTracking}
            processPayment={processPayment}
          />

          <MapPanel
            pickupLat={trackingBooking?.pickupLat}
            pickupLon={trackingBooking?.pickupLon}
            destinationLat={trackingBooking?.destinationLat}
            destinationLon={trackingBooking?.destinationLon}
          />
        </section>
      )}

      {activeTab === "drivers" && <DriverList bookings={bookings} />}
    </main>
  );
}
