"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, LogOut, Route } from "lucide-react";
import DriverDashboard from "@/components/DriverDashboard";
import DriverLogin from "@/components/DriverLogin";
import { drivers } from "@/data/drivers";
import { supabase } from "@/lib/supabaseClient";
import type { Booking, Driver } from "@/types/cabsonline";
import { dbToBooking, getDriverTrips } from "@/utils/bookingFilters";

export default function DriverPage() {
  const [driverId, setDriverId] = useState("");
  const [driver, setDriver] = useState<Driver | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("");

  async function loadBookingsFromSupabase() {
    const { data, error } = await supabase
      .from("cabsonline_bookings")
      .select("*")
      .order("pickup_date", { ascending: true })
      .order("pickup_time", { ascending: true });

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setBookings((data || []).map(dbToBooking));
  }

  useEffect(() => {
    if (driver) {
      loadBookingsFromSupabase();
    }
  }, [driver]);

  const trips = useMemo(() => {
    if (!driver) return [];
    return getDriverTrips(driver.id, bookings);
  }, [driver, bookings]);

  function loginDriver(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const matchingDriver = drivers.find(
      (item) => item.id === driverId.trim().toUpperCase()
    );

    if (!matchingDriver) {
      setMessage("Enter a valid driver ID: DRV001, DRV002, DRV003, or DRV004.");
      return;
    }

    setDriver(matchingDriver);
    setDriverId(matchingDriver.id);
    setMessage(`Logged in as ${matchingDriver.name}.`);
  }

  function logoutDriver() {
    setDriver(null);
    setDriverId("");
    setBookings([]);
    setMessage("Logged out of driver dashboard.");
  }

  async function updateTrip(
    bookingRef: string,
    action: "on_way" | "picked_up" | "finish"
  ) {
    const booking = bookings.find((item) => item.bookingRef === bookingRef);

    if (!booking || booking.status === "unassigned") {
      setMessage("Only assigned bookings can be progressed by drivers.");
      return;
    }

    if (booking.paymentStatus !== "paid") {
      setMessage("Customer payment is required before trip progress.");
      return;
    }

    const update =
      action === "finish"
        ? { tracking_step: 4, status: "completed" }
        : { tracking_step: 3, status: "assigned" };

    const { error } = await supabase
      .from("cabsonline_bookings")
      .update(update)
      .eq("booking_ref", bookingRef)
      .eq("driver_id", driver?.id || "");

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    if (action === "finish") {
      setMessage(`Trip ${bookingRef} has been completed.`);
    } else if (action === "picked_up") {
      setMessage(`Passenger pickup confirmed for ${bookingRef}.`);
    } else {
      setMessage(`Driver is on the way for ${bookingRef}.`);
    }

    await loadBookingsFromSupabase();
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">CabsOnline Driver</p>
          <h1>Driver Dashboard</h1>
          <p>
            Drivers can view assigned trips and update customer tracking as the
            trip progresses.
          </p>
        </div>

        <div className="heroCard">
          <Route size={36} />
          <strong>{driver ? trips.length : 0}</strong>
          <span>Assigned Trips</span>
        </div>
      </header>

      {message && (
        <div className="message">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {!driver ? (
        <DriverLogin
          driverId={driverId}
          setDriverId={setDriverId}
          loginDriver={loginDriver}
        />
      ) : (
        <>
          <div className="adminToolbar">
            <button onClick={logoutDriver}>
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <DriverDashboard
            driver={driver}
            trips={trips}
            updateTrip={updateTrip}
          />
        </>
      )}
    </main>
  );
}
