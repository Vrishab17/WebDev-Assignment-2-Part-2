export type BookingStatus = "unassigned" | "assigned" | "completed";
export type PaymentStatus = "pending" | "paid";

export type Booking = {
  bookingRef: string;
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
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  driverId: string;
  driverName: string;
  driverCar: string;
  driverPlate: string;
  bookingCreated: string;
  estimatedFare: number;
  trackingStep: number;
};

export type Driver = {
  id: string;
  name: string;
  car: string;
  plate: string;
  suburb: string;
  rating: number;
  available: boolean;
};

export type AddressResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
  };
};