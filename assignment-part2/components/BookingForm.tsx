"use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import type { AddressResult } from "@/types/cabsonline";

type BookingFormState = {
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
  paymentMethod: string;
};

type Props = {
  form: BookingFormState;
  updateForm: (field: string, value: string | number | undefined) => void;
  submitBooking: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function BookingForm({ form, updateForm, submitBooking }: Props) {
  function fillPickupAddress(result: AddressResult) {
    updateForm("pickupAddress", result.display_name);
    updateForm("snumber", result.address?.house_number || "");
    updateForm("stname", result.address?.road || "");
    updateForm(
      "sbname",
      result.address?.suburb ||
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        ""
    );
    updateForm("pickupLat", Number(result.lat));
    updateForm("pickupLon", Number(result.lon));
  }

  function fillDestinationAddress(result: AddressResult) {
    updateForm("destinationAddress", result.display_name);
    updateForm(
      "dsbname",
      result.address?.suburb ||
        result.address?.city ||
        result.address?.town ||
        result.address?.village ||
        ""
    );
    updateForm("destinationLat", Number(result.lat));
    updateForm("destinationLon", Number(result.lon));
  }

  return (
    <div className="card">
      <h2>Book a Taxi</h2>

      <form className="form" onSubmit={submitBooking}>
        <label>Customer Name</label>
        <input
          value={form.cname}
          onChange={(event) => updateForm("cname", event.target.value)}
        />

        <label>Phone Number</label>
        <input
          value={form.phone}
          onChange={(event) => updateForm("phone", event.target.value)}
        />

        <AddressAutocomplete
          label="Pickup Address"
          value={form.pickupAddress}
          onSelect={fillPickupAddress}
        />

        <AddressAutocomplete
          label="Destination Address"
          value={form.destinationAddress}
          onSelect={fillDestinationAddress}
        />

        <label>Unit Number</label>
        <input
          value={form.unumber}
          onChange={(event) => updateForm("unumber", event.target.value)}
        />

        <label>Street Number</label>
        <input
          value={form.snumber}
          onChange={(event) => updateForm("snumber", event.target.value)}
        />

        <label>Street Name</label>
        <input
          value={form.stname}
          onChange={(event) => updateForm("stname", event.target.value)}
        />

        <label>Pickup Suburb</label>
        <input
          value={form.sbname}
          onChange={(event) => updateForm("sbname", event.target.value)}
        />

        <label>Destination Suburb</label>
        <input
          value={form.dsbname}
          onChange={(event) => updateForm("dsbname", event.target.value)}
        />

        <label>Pickup Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(event) => updateForm("date", event.target.value)}
        />

        <label>Pickup Time</label>
        <input
          type="time"
          value={form.time}
          onChange={(event) => updateForm("time", event.target.value)}
        />

        <label>Payment Method</label>
        <select
          value={form.paymentMethod}
          onChange={(event) => updateForm("paymentMethod", event.target.value)}
        >
          <option>Card</option>
          <option>Cash</option>
          <option>Online Wallet</option>
        </select>

        <button className="primary" type="submit">
          Submit Booking
        </button>
      </form>
    </div>
  );
}