import { SUPPORTED_CARRIER_SLUGS } from "@/lib/data/supported-carrier-slugs.generated";

/**
 * Carrier logo mapping. Keyed by the stable carrier `code` (not display
 * name) since that's what's stored on every shipment record and is
 * case/spelling-stable across the app. The value is the filename (without
 * extension) expected in /public/carriers — this is the full set of
 * filenames the app knows how to wire up; whether a given carrier is
 * actually *shown* anywhere depends on whether that file exists, per
 * `isCarrierLogoAvailable` below.
 *
 * To add a new carrier:
 *   1. Drop the logo file into /public/carriers (e.g. dhl.svg).
 *   2. Add one line here mapping the carrier's code to its slug.
 *   3. Add its entry to CARRIER_DEFINITIONS in src/lib/data/carriers.ts.
 * Nothing else needs to change — the carrier appears everywhere the moment
 * `npm run dev` / `npm run build` re-scans public/carriers.
 */
export const CARRIER_LOGO_DIR = "/carriers";
export const DEFAULT_CARRIER_LOGO = `${CARRIER_LOGO_DIR}/default.svg`;

export const carrierLogoSlugs: Record<string, string> = {
  GENERIC: "default",
  DHL: "dhl",
  FEDEX: "fedex",
  UPS: "ups",
  USPS: "usps",
  ARAMEX: "aramex",
  TNT: "tnt",
  CANADAPOST: "canada-post",
  ROYALMAIL: "royal-mail",
  DPD: "dpd",
  GLS: "gls",
  AUSPOST: "australia-post",
  BLUEDART: "blue-dart",
  PUROLATOR: "purolator",
  JAPANPOST: "japan-post",
  EMS: "ems",
  SFEXPRESS: "sf-express",
  YUNEXPRESS: "yunexpress",
  POSTNL: "postnl",
  CORREOS: "correos",
  SWISSPOST: "swiss-post",
};

const LOGO_FILE_EXTENSION = ".svg";

/** True only if an actual logo file exists on disk for this carrier code (scanned at build/dev start). */
export function isCarrierLogoAvailable(code: string): boolean {
  if (code === "GENERIC") return true; // its logo *is* default.svg, which always ships
  const slug = carrierLogoSlugs[code];
  return Boolean(slug) && SUPPORTED_CARRIER_SLUGS.includes(slug);
}

export function getCarrierLogoSrc(code: string): string {
  if (isCarrierLogoAvailable(code)) {
    const slug = carrierLogoSlugs[code];
    return `${CARRIER_LOGO_DIR}/${slug}${LOGO_FILE_EXTENSION}`;
  }
  return DEFAULT_CARRIER_LOGO;
}
