import type { Driver } from "@/types/cabsonline";

export const drivers: Driver[] = [
  {
    id: "DRV001",
    name: "Aman Singh",
    car: "Toyota Prius",
    plate: "CAB101",
    suburb: "Auckland CBD",
    rating: 4.8,
    available: true,
  },
  {
    id: "DRV002",
    name: "Sarah Lee",
    car: "Toyota Camry",
    plate: "CAB204",
    suburb: "Manukau",
    rating: 4.6,
    available: true,
  },
  {
    id: "DRV003",
    name: "Mo Ahmed",
    car: "Hyundai Ioniq",
    plate: "CAB330",
    suburb: "Northcote",
    rating: 4.9,
    available: true,
  },
  {
    id: "DRV004",
    name: "James Wilson",
    car: "Honda Accord",
    plate: "CAB771",
    suburb: "Mount Eden",
    rating: 4.5,
    available: false,
  },
];