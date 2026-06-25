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

export const SPLAYED_SIZES = [
  { label: "9", internal: 900, leg: 425 },
  { label: "10", internal: 1000, leg: 525 },
  { label: "11", internal: 1100, leg: 625 },
  { label: "12", internal: 1200, leg: 725 },
] as const;

export type QuickScreenKey =
  | "frontReturn"
  | "frontOnly"
  | "splayed"
  | "fixedPanel";

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

export const HSSS_CONTACTS = [
  {
    name: "Bradley",
    email: "bradley@hsss.net.au",
    phone: "0481 145 924",
    role: "Sales",
  },
  {
    name: "Bruce",
    email: "bruce@hsss.net.au",
    phone: "0404 126 775",
    role: "Sales",
  },
  {
    name: "Sam",
    email: "info@hsss.net.au",
    phone: "0457 296 652",
    role: "Scheduling",
  },
] as const;

export const HSSS_ORDER_EMAIL = "bradley@hsss.net.au";
