import { supabase } from "@/lib/supabaseClient";

export type BookingRecord = {
  id?: number;
  booking_ref: string;
  cname: string;
  phone: string;
  unumber?: string;
  snumber: string;
  stname: string;
  sbname?: string;
  dsbname?: string;
  pickup_address?: string;
  destination_address?: string;
  pickup_lat?: number;
  pickup_lon?: number;
  destination_lat?: number;
  destination_lon?: number;
  pickup_date: string;
  pickup_time: string;
  booking_datetime?: string;
  status: string;
  payment_status?: string;
  driver_id?: string;
  driver_name?: string;
  driver_car?: string;
  driver_plate?: string;
};

export async function generateBookingReference() {
  const { data, error } = await supabase
    .from("cabsonline_bookings")
    .select("booking_ref")
    .order("id", { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return "BRN00001";
  }

  const lastNumber = Number(data[0].booking_ref.replace("BRN", ""));
  const nextNumber = lastNumber + 1;

  return "BRN" + String(nextNumber).padStart(5, "0");
}

export async function createBooking(form: {
  cname: string;
  phone: string;
  unumber: string;
  snumber: string;
  stname: string;
  sbname: string;
  dsbname: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLon?: number;
  destinationLat?: number;
  destinationLon?: number;
  date: string;
  time: string;
}) {
  const bookingRef = await generateBookingReference();

  const newBooking = {
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
  };

  const { error } = await supabase
    .from("cabsonline_bookings")
    .insert(newBooking);

  if (error) throw error;

  return {
    success: true,
    booking_ref: bookingRef,
    pickup_time: form.time,
    pickup_date: form.date,
  };
}

export async function searchBookings(bsearch = "") {
  if (bsearch.trim() !== "") {
    const { data, error } = await supabase
      .from("cabsonline_bookings")
      .select("*")
      .eq("booking_ref", bsearch.trim());

    if (error) throw error;

    return data;
  }

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const today = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().slice(0, 8);
  const laterTime = twoHoursLater.toTimeString().slice(0, 8);

  const { data, error } = await supabase
    .from("cabsonline_bookings")
    .select("*")
    .eq("status", "unassigned")
    .eq("pickup_date", today)
    .gte("pickup_time", currentTime)
    .lte("pickup_time", laterTime)
    .order("pickup_time", { ascending: true });

  if (error) throw error;

  return data;
}

export async function assignBooking(
  bookingRef: string,
  driver: {
    id: string;
    name: string;
    car: string;
    plate: string;
  }
) {
  const { error } = await supabase
    .from("cabsonline_bookings")
    .update({
      status: "assigned",
      driver_id: driver.id,
      driver_name: driver.name,
      driver_car: driver.car,
      driver_plate: driver.plate,
    })
    .eq("booking_ref", bookingRef);

  if (error) throw error;

  return {
    success: true,
    message: `Congratulations! Booking request ${bookingRef} has been assigned!`,
  };
}

export async function processPayment(bookingRef: string) {
  const { error } = await supabase
    .from("cabsonline_bookings")
    .update({
      payment_status: "paid",
    })
    .eq("booking_ref", bookingRef);

  if (error) throw error;
}

export async function completeBooking(bookingRef: string) {
  const { error } = await supabase
    .from("cabsonline_bookings")
    .update({
      status: "completed",
    })
    .eq("booking_ref", bookingRef);

  if (error) throw error;
}