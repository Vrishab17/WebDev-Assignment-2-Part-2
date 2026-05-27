"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle, LogOut, ShieldCheck } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import AvailableDriversPanel from "@/components/AvailableDriversPanel";
import { drivers } from "@/data/drivers";
import { supabase } from "@/lib/supabaseClient";
import type { Booking } from "@/types/cabsonline";
import { dbToBooking, filterAdminBookings } from "@/utils/bookingFilters";
import {
  getAvailableDrivers,
  isDriverBusyWithinNextHour,
} from "@/utils/driverUtils";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "cabsonline123";

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [adminSearch, setAdminSearch] = useState("");
  const [message, setMessage] = useState("");

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
    if (loggedIn) {
      loadBookingsFromSupabase();
    }
  }, [loggedIn]);

  const filteredBookings = useMemo(
    () => filterAdminBookings(bookings, adminSearch),
    [bookings, adminSearch]
  );
  const availableDrivers = useMemo(
    () => getAvailableDrivers(bookings),
    [bookings]
  );

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setPassword("");
      setMessage("Admin login successful.");
      return;
    }

    setMessage("Invalid admin username or password.");
  }

  function handleLogout() {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setAdminSearch("");
    setMessage("Logged out of admin.");
  }

  async function assignDriver(bookingRef: string, driverId: string) {
    const driver = drivers.find((item) => item.id === driverId);

    if (!driver) return;

    if (isDriverBusyWithinNextHour(driver.id, bookings)) {
      setMessage(`${driver.name} has a booking within the next hour.`);
      return;
    }

    const { error } = await supabase
      .from("cabsonline_bookings")
      .update({
        status: "assigned",
        driver_id: driver.id,
        driver_name: driver.name,
        driver_car: driver.car,
        driver_plate: driver.plate,
        tracking_step: 2,
      })
      .eq("booking_ref", bookingRef);

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage(`Booking ${bookingRef} has been assigned to ${driver.name}.`);
    await loadBookingsFromSupabase();
  }

  async function clearDemoData() {
    const { error } = await supabase
      .from("cabsonline_bookings")
      .delete()
      .neq("booking_ref", "");

    if (error) {
      console.error(error);
      setMessage(error.message);
      return;
    }

    setMessage("Demo data has been cleared.");
    await loadBookingsFromSupabase();
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">CabsOnline Admin</p>
          <h1>Admin Control Centre</h1>
          <p>
            Sign in with the demo admin account to search active bookings and
            assign available drivers.
          </p>
        </div>

        <div className="heroCard">
          <ShieldCheck size={36} />
          <strong>{loggedIn ? filteredBookings.length : 0}</strong>
          <span>Active Bookings</span>
        </div>
      </header>

      {message && (
        <div className="message">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {!loggedIn ? (
        <section className="card loginCard">
          <h2>Admin Login</h2>
          <form className="form" onSubmit={handleLogin}>
            <label>Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />

            <button className="primary" type="submit">
              Login
            </button>
          </form>
        </section>
      ) : (
        <>
          <div className="adminToolbar">
            <button onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>

          <AdminDashboard
            bookings={filteredBookings}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            assignDriver={assignDriver}
            clearDemoData={clearDemoData}
            availableDrivers={availableDrivers}
          />

          <AvailableDriversPanel bookings={bookings} />
        </>
      )}
    </main>
  );
}
