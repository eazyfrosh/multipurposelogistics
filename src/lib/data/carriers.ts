import type { LucideIcon } from "lucide-react";
import { Truck, Plane, Ship, Package, Globe, Bike } from "lucide-react";
import type { ServiceType } from "@/types";

export interface CarrierDefinition {
  code: string;
  name: string;
  prefix: string;
  icon: LucideIcon;
  region: string;
  serviceTypes: ServiceType[];
}

/**
 * Fictional demo platform: these are shown as "supported carrier integrations"
 * using generic icons and plain text only — no official logos or trademarks.
 * Real carrier names are referenced solely to illustrate multi-carrier
 * aggregation, in the same spirit as public rate-shopping APIs.
 */
export const CARRIERS: CarrierDefinition[] = [
  { code: "DHL", name: "DHL", prefix: "DHL", icon: Plane, region: "Global", serviceTypes: ["express", "economy", "priority"] },
  { code: "FEDEX", name: "FedEx", prefix: "FDX", icon: Plane, region: "Global", serviceTypes: ["express", "priority", "standard"] },
  { code: "UPS", name: "UPS", prefix: "UPS", icon: Truck, region: "Global", serviceTypes: ["express", "standard", "economy"] },
  { code: "USPS", name: "USPS", prefix: "USP", icon: Truck, region: "United States", serviceTypes: ["standard", "economy", "priority"] },
  { code: "TNT", name: "TNT", prefix: "TNT", icon: Plane, region: "Europe", serviceTypes: ["express", "economy"] },
  { code: "ARAMEX", name: "Aramex", prefix: "ARX", icon: Truck, region: "Middle East", serviceTypes: ["express", "standard"] },
  { code: "CANADAPOST", name: "Canada Post", prefix: "CNP", icon: Truck, region: "Canada", serviceTypes: ["standard", "economy", "priority"] },
  { code: "ROYALMAIL", name: "Royal Mail", prefix: "RML", icon: Truck, region: "United Kingdom", serviceTypes: ["standard", "economy", "priority"] },
  { code: "DPD", name: "DPD", prefix: "DPD", icon: Truck, region: "Europe", serviceTypes: ["express", "standard"] },
  { code: "AUSPOST", name: "Australia Post", prefix: "AUP", icon: Truck, region: "Australia", serviceTypes: ["standard", "economy", "priority"] },
  { code: "BLUEDART", name: "BlueDart", prefix: "BLD", icon: Truck, region: "India", serviceTypes: ["express", "priority"] },
  { code: "PUROLATOR", name: "Purolator", prefix: "PUR", icon: Truck, region: "Canada", serviceTypes: ["express", "standard"] },
  { code: "JAPANPOST", name: "Japan Post", prefix: "JPP", icon: Ship, region: "Japan", serviceTypes: ["standard", "economy"] },
  { code: "EMS", name: "EMS", prefix: "EMS", icon: Globe, region: "Global", serviceTypes: ["express", "priority"] },
  { code: "SFEXPRESS", name: "SF Express", prefix: "SFX", icon: Plane, region: "China", serviceTypes: ["express", "priority"] },
  { code: "YUNEXPRESS", name: "YunExpress", prefix: "YUN", icon: Ship, region: "China", serviceTypes: ["economy", "standard"] },
  { code: "GLS", name: "GLS", prefix: "GLS", icon: Truck, region: "Europe", serviceTypes: ["standard", "economy"] },
  { code: "HERMES", name: "Hermes", prefix: "HRM", icon: Bike, region: "Europe", serviceTypes: ["standard", "economy"] },
  { code: "POSTNL", name: "PostNL", prefix: "PNL", icon: Truck, region: "Netherlands", serviceTypes: ["standard", "economy"] },
  { code: "CORREOS", name: "Correos", prefix: "COR", icon: Truck, region: "Spain", serviceTypes: ["standard", "economy"] },
  { code: "SWISSPOST", name: "Swiss Post", prefix: "SWP", icon: Truck, region: "Switzerland", serviceTypes: ["standard", "priority"] },
];

export const GENERIC_CARRIER: CarrierDefinition = {
  code: "GENERIC",
  name: "TrackNova Direct",
  prefix: "TRK",
  icon: Package,
  region: "Global",
  serviceTypes: ["express", "economy", "priority", "standard"],
};

export const ALL_CARRIERS = [...CARRIERS, GENERIC_CARRIER];

export function getCarrier(code: string): CarrierDefinition {
  return ALL_CARRIERS.find((c) => c.code === code) ?? GENERIC_CARRIER;
}

/**
 * Generic "logo mark" palette for carrier badges — the same trick apps like
 * Wise or Stripe Atlas use for institutions without a usable real logo:
 * a colored monogram chip. Deliberately generic tones (no brand's actual
 * color pairing, e.g. no red+yellow, no purple+orange, no brown+gold) cycled
 * by a simple hash so the assignment is arbitrary, not brand-mimicking.
 */
const MONOGRAM_PALETTE: [string, string][] = [
  ["#6366f1", "#4f46e5"], // indigo
  ["#14b8a6", "#0d9488"], // teal
  ["#0ea5e9", "#0284c7"], // sky
  ["#8b5cf6", "#7c3aed"], // violet
  ["#10b981", "#059669"], // emerald
  ["#f59e0b", "#d97706"], // amber
  ["#d946ef", "#c026d3"], // fuchsia
  ["#06b6d4", "#0891b2"], // cyan
];

export function carrierMonogramColors(code: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) % MONOGRAM_PALETTE.length;
  return MONOGRAM_PALETTE[Math.abs(hash) % MONOGRAM_PALETTE.length];
}

export const CARRIER_DISCLAIMER =
  "TrackNova is an independent, fictional demo platform built for educational and portfolio purposes. It is not affiliated with, endorsed by, or connected to any of the carriers named above. Carrier names are shown only to illustrate multi-carrier integration; all shipment data, tracking numbers, and events are simulated.";
