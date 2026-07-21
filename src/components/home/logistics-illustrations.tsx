/**
 * Original flat-vector illustrations — hand-built shapes, not traced or
 * copied from any photo or third-party artwork. Kept simple/geometric on
 * purpose so they read clearly at small sizes.
 */

const BRAND = "var(--color-brand-500)";
const BRAND_DARK = "var(--color-brand-700)";
const TEAL = "var(--color-teal-accent-500)";
const GOLD = "var(--color-gold-500)";

export function GlobalNetworkArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
      <circle cx="60" cy="60" r="42" fill={BRAND} fillOpacity="0.1" />
      <circle cx="60" cy="60" r="42" stroke={BRAND} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M28 46 Q60 70 92 50" stroke={TEAL} strokeOpacity="0.6" strokeWidth="1.5" fill="none" />
      <path d="M32 78 Q60 58 88 76" stroke={BRAND} strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
      <circle cx="28" cy="46" r="3" fill={TEAL} />
      <circle cx="92" cy="50" r="3" fill={BRAND} />
      <circle cx="32" cy="78" r="3" fill={BRAND} />
      <circle cx="88" cy="76" r="3" fill={TEAL} />
      <g transform="translate(60 34)">
        <path d="M0 0 C7 0 12 6 12 13 C12 22 0 34 0 34 C0 34 -12 22 -12 13 C-12 6 -7 0 0 0 Z" fill={GOLD} />
        <circle cx="0" cy="13" r="4.5" fill="white" />
      </g>
    </svg>
  );
}

export function WarehouseArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
      <circle cx="60" cy="60" r="42" fill={TEAL} fillOpacity="0.1" />
      <polygon points="30,58 60,38 90,58 90,66 30,66" fill={BRAND} fillOpacity="0.85" />
      <rect x="34" y="66" width="52" height="30" rx="2" fill={BRAND} fillOpacity="0.65" />
      <rect x="52" y="78" width="16" height="18" fill="white" fillOpacity="0.9" />
      <rect x="38" y="72" width="9" height="9" fill="white" fillOpacity="0.5" />
      <rect x="73" y="72" width="9" height="9" fill="white" fillOpacity="0.5" />
      <g transform="translate(20 84)">
        <rect x="0" y="6" width="14" height="12" rx="1.5" fill={GOLD} />
        <rect x="4" y="0" width="14" height="12" rx="1.5" fill={GOLD} fillOpacity="0.7" />
      </g>
    </svg>
  );
}

export function LiveTrackingArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
      <circle cx="60" cy="60" r="42" fill={GOLD} fillOpacity="0.12" />
      <rect x="42" y="26" width="36" height="68" rx="10" fill={BRAND_DARK} />
      <rect x="46" y="34" width="28" height="48" rx="3" fill="white" fillOpacity="0.95" />
      <path d="M50 66 Q60 54 70 58" stroke={BRAND} strokeWidth="2" strokeDasharray="2.5 3" fill="none" />
      <g transform="translate(66 50)">
        <path d="M0 0 C4 0 7 3.2 7 7 C7 12 0 19 0 19 C0 19 -7 12 -7 7 C-7 3.2 -4 0 0 0 Z" fill={TEAL} />
        <circle cx="0" cy="7" r="2.6" fill="white" />
      </g>
      <circle cx="60" cy="88" r="2.2" fill={BRAND} />
    </svg>
  );
}

export function AirSeaFreightArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
      <circle cx="60" cy="60" r="42" fill={BRAND} fillOpacity="0.1" />
      <path d="M22 82 Q60 70 98 82" stroke={TEAL} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M40 82 L46 68 L54 68 L52 82 Z" fill={BRAND} fillOpacity="0.75" />
      <path d="M54 82 L58 72 L64 72 L64 82 Z" fill={BRAND} />
      <g transform="translate(66 34) rotate(18)">
        <path d="M0 0 L34 4 L44 0 L34 -4 Z M18 -2 L18 -18 L23 -18 L26 -2 Z M18 2 L18 18 L23 18 L26 2 Z M-6 0 L-18 -8 L-18 8 Z" fill={GOLD} />
      </g>
    </svg>
  );
}

export function DoorstepDeliveryArt() {
  return (
    <svg viewBox="0 0 120 120" fill="none" className="h-full w-full">
      <circle cx="60" cy="60" r="42" fill={TEAL} fillOpacity="0.12" />
      <rect x="66" y="28" width="30" height="64" rx="2" fill={BRAND_DARK} fillOpacity="0.9" />
      <circle cx="90" cy="60" r="2" fill="white" />
      <g transform="translate(26 58)">
        <rect x="0" y="8" width="30" height="26" rx="2" fill={GOLD} />
        <rect x="0" y="8" width="30" height="8" fill={BRAND} fillOpacity="0.5" />
        <path d="M15 8 V34" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
      </g>
      <g transform="translate(48 82)">
        <circle r="11" fill={BRAND} />
        <path d="M-4 0 L-1 4 L5 -5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
