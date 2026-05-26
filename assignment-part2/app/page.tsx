"use client";

/*
Student Name: Vrishab Chetty
File: page.tsx
Description: Main page for the CabsOnline Part 2 Next.js application.
*/

import { useEffect, useMemo, useState } from "react";
import { Car, CheckCircle } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import AdminDashboard from "@/components/AdminDashboard";
import TrackingPanel from "@/components/TrackingPanel";
import DriverList from "@/components/DriverList";
import MapPanel from "@/components/MapPanel";
import { drivers } from "@/data/drivers";
import type { Booking } from "@/types/cabsonline";
import {
  estimateFare,
  formatDate,
  generateBookingReference,
  getCurrentTime,
  getToday,
  loadBookings,
  saveBookings,
  STORAGE_KEY,
} from "@/utils/bookingUtils";

export default function Home() {
  const [activeTab, setActiveTab] = useState("booking");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
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

  useEffect(() => {
    setBookings(loadBookings());
  }, []);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (!adminSearch.trim()) return bookings;

    return bookings.filter((booking) =>
      booking.bookingRef.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [bookings, adminSearch]);

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
      form.snumber.trim() === "" ||
      form.stname.trim() === "" ||
      form.pickupAddress.trim() === "" ||
      form.destinationAddress.trim() === ""
    ) {
      return "Please fill in customer name, phone, pickup address, destination address, street number, and street name.";
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

  function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = validateBooking();

    if (error) {
      setMessage(error);
      return;
    }

    const bookingRef = generateBookingReference(bookings);

    const newBooking: Booking = {
      bookingRef,
      ...form,
      status: "unassigned",
      paymentStatus: "pending",
      driverId: "",
      driverName: "",
      driverCar: "",
      driverPlate: "",
      bookingCreated: new Date().toISOString(),
      estimatedFare: estimateFare(form.sbname, form.dsbname),
      trackingStep: 1,
    };

    setBookings((previous) => [...previous, newBooking]);
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
  }

  function assignDriver(bookingRef: string, driverId: string) {
    const driver = drivers.find((item) => item.id === driverId);

    if (!driver) return;

    setBookings((previous) =>
      previous.map((booking) =>
        booking.bookingRef === bookingRef
          ? {
              ...booking,
              status: "assigned",
              driverId: driver.id,
              driverName: driver.name,
              driverCar: driver.car,
              driverPlate: driver.plate,
              trackingStep: Math.max(booking.trackingStep, 2),
            }
          : booking
      )
    );

    setMessage(`Booking ${bookingRef} has been assigned to ${driver.name}.`);
  }

  function processPayment(bookingRef: string) {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.bookingRef === bookingRef
          ? {
              ...booking,
              paymentStatus: "paid",
            }
          : booking
      )
    );

    setMessage(`Payment for booking ${bookingRef} has been completed.`);
  }

  function progressTracking(bookingRef: string) {
    setBookings((previous) =>
      previous.map((booking) => {
        if (booking.bookingRef !== bookingRef) return booking;

        const nextStep = Math.min(4, booking.trackingStep + 1);

        return {
          ...booking,
          trackingStep: nextStep,
          status: nextStep >= 4 ? "completed" : booking.status,
        };
      })
    );
  }

  function clearDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    setBookings([]);
    setMessage("Demo data has been cleared.");
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">CabsOnline Part 2</p>
          <h1>Modern Taxi Booking System</h1>
          <p>
            A Next.js extension of the Part 1 taxi booking system with real NZ
            address search, map-based interaction, driver assignment, customer
            tracking, and payment simulation.
          </p>
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
          className={activeTab === "admin" ? "active" : ""}
          onClick={() => setActiveTab("admin")}
        >
          Admin Dashboard
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

      {activeTab === "admin" && (
        <AdminDashboard
          bookings={filteredBookings}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          assignDriver={assignDriver}
          processPayment={processPayment}
          clearDemoData={clearDemoData}
        />
      )}

      {activeTab === "tracking" && (
        <section className="grid two">
          <TrackingPanel
            trackingSearch={trackingSearch}
            setTrackingSearch={setTrackingSearch}
            trackingBooking={trackingBooking}
            progressTracking={progressTracking}
          />

          <MapPanel
            pickupLat={trackingBooking?.pickupLat}
            pickupLon={trackingBooking?.pickupLon}
            destinationLat={trackingBooking?.destinationLat}
            destinationLon={trackingBooking?.destinationLon}
          />
        </section>
      )}

      {activeTab === "drivers" && <DriverList />}
    </main>
  );
}