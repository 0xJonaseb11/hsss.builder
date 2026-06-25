import type { ServiceType } from "@/types/database";

export const REGIONS = [
  "Gold Coast",
  "Brisbane",
  "Ipswich",
  "Toowoomba",
  "Sunshine Coast",
] as const;

export const SERVICE_TYPES: ServiceType[] = [
  "Supply & Install",
  "Supply Only",
];

export const COLOURS = [
  "Chrome",
  "Black",
  "Brushed Nickel",
  "Brushed Brass",
] as const;

export const AU_STATES = ["QLD", "NSW", "VIC", "SA", "WA", "TAS", "NT", "ACT"] as const;

export const LOCATION_OPTIONS = [
  "Bathroom",
  "Ensuite",
  "Main Bathroom",
  "Guest Bathroom",
  "Powder Room",
  "Other",
] as const;

export const BRAND = {
  navy: "#003A70",
  navyDeep: "#001B3D",
  cyan: "#00AEEF",
  muted: "#5A7D9E",
} as const;
