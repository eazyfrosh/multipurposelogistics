/**
 * Carrier logo mapping. Keyed by the stable carrier `code` (not display
 * name) since that's what's stored on every shipment record and is
 * case/spelling-stable across the app.
 *
 * To add a new carrier logo:
 *   1. Drop the file into /public/carriers (svg preferred; png/jpg/webp
 *      also supported).
 *   2. Add one line here mapping the carrier's code to its path.
 * No other code changes are required — <CarrierLogo> and every screen that
 * uses it will pick it up automatically, and falls back to default.svg for
 * any carrier without an entry (or whose file fails to load).
 */
export const CARRIER_LOGO_DIR = "/carriers";
export const DEFAULT_CARRIER_LOGO = `${CARRIER_LOGO_DIR}/default.svg`;

export const carrierLogos: Record<string, string> = {
  DHL: `${CARRIER_LOGO_DIR}/dhl.svg`,
  FEDEX: `${CARRIER_LOGO_DIR}/fedex.svg`,
  UPS: `${CARRIER_LOGO_DIR}/ups.svg`,
  USPS: `${CARRIER_LOGO_DIR}/usps.svg`,
  ARAMEX: `${CARRIER_LOGO_DIR}/aramex.svg`,
  TNT: `${CARRIER_LOGO_DIR}/tnt.svg`,
  CANADAPOST: `${CARRIER_LOGO_DIR}/canada-post.svg`,
  ROYALMAIL: `${CARRIER_LOGO_DIR}/royal-mail.svg`,
  DPD: `${CARRIER_LOGO_DIR}/dpd.svg`,
  GLS: `${CARRIER_LOGO_DIR}/gls.svg`,
  AUSPOST: `${CARRIER_LOGO_DIR}/australia-post.svg`,
  BLUEDART: `${CARRIER_LOGO_DIR}/blue-dart.svg`,
  PUROLATOR: `${CARRIER_LOGO_DIR}/purolator.svg`,
  JAPANPOST: `${CARRIER_LOGO_DIR}/japan-post.svg`,
  EMS: `${CARRIER_LOGO_DIR}/ems.svg`,
  SFEXPRESS: `${CARRIER_LOGO_DIR}/sf-express.svg`,
  YUNEXPRESS: `${CARRIER_LOGO_DIR}/yunexpress.svg`,
  POSTNL: `${CARRIER_LOGO_DIR}/postnl.svg`,
  CORREOS: `${CARRIER_LOGO_DIR}/correos.svg`,
  SWISSPOST: `${CARRIER_LOGO_DIR}/swiss-post.svg`,
};

export function getCarrierLogoSrc(code: string): string {
  return carrierLogos[code] ?? DEFAULT_CARRIER_LOGO;
}
