import type { LucideIcon } from "lucide-react";
import { Truck, Plane, Package } from "lucide-react";
import type { ServiceType } from "@/types";
import { isCarrierLogoAvailable } from "@/lib/data/carrier-logos";

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
 * with each carrier's logo rendered via <CarrierLogo> — no official logos or
 * trademarks ship in this repo. Real carrier names are referenced solely to
 * illustrate multi-carrier aggregation, in the same spirit as public
 * rate-shopping APIs.
 *
 * This is the full catalog of carriers the app *knows about*. Which of these
 * actually show up anywhere (dropdowns, landing page, filters, etc.) is
 * filtered down to only carriers with a real logo file in public/carriers —
 * see CARRIERS below. public/carriers is the source of truth: add a logo
 * file + a line here, and the carrier appears everywhere on the next
 * `npm run dev` / `npm run build`; remove the file and it disappears.
 */
const CARRIER_DEFINITIONS: CarrierDefinition[] = [
  { code: "DHL", name: "DHL", prefix: "DHL", icon: Plane, region: "Global", serviceTypes: ["express", "economy", "priority"] },
  { code: "FEDEX", name: "FedEx", prefix: "FDX", icon: Plane, region: "Global", serviceTypes: ["express", "priority", "standard"] },
  { code: "UPS", name: "UPS", prefix: "UPS", icon: Truck, region: "Global", serviceTypes: ["express", "standard", "economy"] },
  { code: "USPS", name: "USPS", prefix: "USP", icon: Truck, region: "United States", serviceTypes: ["standard", "economy", "priority"] },
  { code: "ARAMEX", name: "Aramex", prefix: "ARX", icon: Truck, region: "Middle East", serviceTypes: ["express", "standard"] },
  { code: "TNT", name: "TNT", prefix: "TNT", icon: Plane, region: "Europe", serviceTypes: ["express", "economy"] },
  { code: "CANADAPOST", name: "Canada Post", prefix: "CNP", icon: Truck, region: "Canada", serviceTypes: ["standard", "economy", "priority"] },
  { code: "ROYALMAIL", name: "Royal Mail", prefix: "RML", icon: Truck, region: "United Kingdom", serviceTypes: ["standard", "economy", "priority"] },
  { code: "DPD", name: "DPD", prefix: "DPD", icon: Truck, region: "Europe", serviceTypes: ["express", "standard"] },
  { code: "GLS", name: "GLS", prefix: "GLS", icon: Truck, region: "Europe", serviceTypes: ["standard", "economy"] },
  { code: "AUSPOST", name: "Australia Post", prefix: "AUP", icon: Truck, region: "Australia", serviceTypes: ["standard", "economy", "priority"] },
  { code: "BLUEDART", name: "BlueDart", prefix: "BLD", icon: Truck, region: "India", serviceTypes: ["express", "priority"] },
  { code: "PUROLATOR", name: "Purolator", prefix: "PUR", icon: Truck, region: "Canada", serviceTypes: ["express", "standard"] },
  { code: "JAPANPOST", name: "Japan Post", prefix: "JPP", icon: Truck, region: "Japan", serviceTypes: ["standard", "economy"] },
  { code: "EMS", name: "EMS", prefix: "EMS", icon: Plane, region: "Global", serviceTypes: ["express", "priority"] },
  { code: "SFEXPRESS", name: "SF Express", prefix: "SFX", icon: Plane, region: "China", serviceTypes: ["express", "priority"] },
  { code: "YUNEXPRESS", name: "YunExpress", prefix: "YUN", icon: Truck, region: "China", serviceTypes: ["economy", "standard"] },
  { code: "POSTNL", name: "PostNL", prefix: "PNL", icon: Truck, region: "Netherlands", serviceTypes: ["standard", "economy"] },
  { code: "CORREOS", name: "Correos", prefix: "COR", icon: Truck, region: "Spain", serviceTypes: ["standard", "economy"] },
  { code: "SWISSPOST", name: "Swiss Post", prefix: "SWP", icon: Truck, region: "Switzerland", serviceTypes: ["standard", "priority"] },
];

/** Only carriers with an actual logo file present in public/carriers/. */
export const CARRIERS: CarrierDefinition[] = CARRIER_DEFINITIONS.filter((c) => isCarrierLogoAvailable(c.code));

export const GENERIC_CARRIER: CarrierDefinition = {
  code: "GENERIC",
  name: "TrackNova Direct",
  prefix: "TRK",
  icon: Package,
  region: "Global",
  serviceTypes: ["express", "economy", "priority", "standard"],
};

/** GENERIC is always available — its logo is default.svg, which always ships. */
export const ALL_CARRIERS = [...CARRIERS, GENERIC_CARRIER];

export function getCarrier(identifier: string): CarrierDefinition {
  const exact = ALL_CARRIERS.find((c) => c.code === identifier);
  if (exact) return exact;
  const normalized = identifier.trim().toLowerCase();
  const byNameOrCode = ALL_CARRIERS.find(
    (c) => c.code.toLowerCase() === normalized || c.name.toLowerCase() === normalized
  );
  return byNameOrCode ?? GENERIC_CARRIER;
}

export const CARRIER_DISCLAIMER =
  "TrackNova is an independent, fictional demo platform built for educational and portfolio purposes. It is not affiliated with, endorsed by, or connected to any of the carriers named above. Carrier names are shown only to illustrate multi-carrier integration; all shipment data, tracking numbers, and events are simulated.";
