# TrackNova — Multi-Carrier Logistics Platform (Demo)

TrackNova is a premium, portfolio/demo logistics and shipment-tracking platform
built to look and feel like a production multi-carrier aggregator (ShipStation
/ EasyPost / Shippo / AfterShip-style). **It is a fictional platform and is not
affiliated with, endorsed by, or connected to DHL, FedEx, UPS, USPS, or any
other real carrier.** Carrier names are shown only as illustrative "supported
integrations", rendered through a logo component that falls back to a
neutral generic icon until real, licensed carrier artwork is supplied — the
repo ships without any real carrier's trademarks — and every shipment,
tracking event, and notification is simulated.

## Tech stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Firebase Authentication + Firestore + Storage (required — see below)
- Framer Motion, React Hook Form + Zod, Recharts, `qrcode`, `jsbarcode`, `xlsx`, `sonner`

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Firebase configuration (required)

There is no local/demo auth mode — every read, write, sign-up, and login goes
through your own Firebase project. Copy `.env.local.example` to `.env.local`
and fill in your project's values — never commit real credentials:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...   # optional, Analytics only
```

All six required `NEXT_PUBLIC_FIREBASE_*` variables must be present (see
`src/lib/firebase/client.ts`, which initializes the SDK exactly once via
`getApps()`). Data reads/writes go through `src/lib/services/store.ts`, which
talks to Firestore directly — if Firebase isn't configured, every call throws
a clear "Firebase is not configured" error rather than silently falling back
to anything. The first admin user must have their `role` field set to
`"admin"` directly in the `users` Firestore collection — there's no self-serve
admin signup (the Firestore rules only ever let a new account create itself
with `role: "user"`).

If you set some but not all of the required client variables, the app warns
in the browser console with the exact missing variable name(s) instead of
failing silently or half-configuring itself.

### Firebase Admin SDK (server-only)

`src/lib/firebase/admin.ts` provides a lazily-initialized, singleton Admin SDK
app for any future Route Handler or Server Action that needs server-side
Firebase access (the app currently has none — everything runs client-side
against the Client SDK, guarded by Firestore security rules). It reads:

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...   # from the service account JSON, \n-escaped
```

Calling `getFirebaseAdminApp()` / `getAdminAuth()` / `getAdminFirestore()`
without all three variables set throws an error naming exactly which one(s)
are missing, rather than failing silently. The module imports `server-only`,
so bundling it into client code is a build-time error.

### Firestore security rules

Deploy `firestore.rules` (Firebase Console → Firestore Database → Rules, or
`firebase deploy --only firestore:rules` with the CLI) before using real
Firebase mode. Highlights:

- `shipments` (full sender/receiver contact details) is owner/admin-only —
  never publicly readable, gettable, or listable.
- The public `/track` pages never touch that collection. Instead, every
  shipment write also syncs a **public mirror** (`shipment_tracking/{id}`,
  name/city/country only — no email/phone/address) and three narrow
  **capability lookups** (`tracking_lookup`, `shipment_lookup`,
  `reference_lookup`, each keyed by the exact number they resolve). All four
  are `get`-only by exact key and never listable, so an anonymous visitor can
  resolve a tracking/shipment/reference number to a shipment without ever
  being able to enumerate or browse other customers' shipments.
- `tracking_events` are readable by anyone who already has a shipmentId
  (matches what the public tracking page already shows); only admins can
  write them.
- Every other collection (`users`, `notifications`, `support_tickets`,
  `carrier_settings`, `activity_logs`) is scoped to its owner and/or admins.

## Feature overview

- **Landing page** — animated gradient hero with a tracking-number search,
  animated stat counters, a "supported integrations" grid (`<CarrierLogo>` +
  a clear non-affiliation disclaimer), feature grid, "how it works",
  testimonials, and an FAQ accordion.
- **Auth** — register/login/forgot-password/verify-email via Firebase
  Authentication, protected dashboard/admin routes.
- **User dashboard** (`/dashboard`) — stat cards (total/delivered/in-transit
  /pending/cancelled/revenue), monthly-shipments bar chart, delivery-status
  donut, carrier-distribution chart, recent activity feed.
- **Shipment management** (`/dashboard/shipments`) — full create/edit form
  (sender, receiver, package, service, cost, insurance), auto-generated
  carrier-prefixed tracking numbers (e.g. `FDX482252259`, `DHL483927492`) and
  shipment numbers, a detail page with QR code + CODE128 barcode + tracking
  link, search/filter/pagination, row-selection bulk status update, CSV/Excel
  export, and CSV bulk import with a downloadable template.
- **Public tracking** (`/track`) — no-sign-in lookup by tracking, reference,
  or shipment number; a result page with current status, progress bar, an
  illustrative checkpoint route visualization (explicitly not live GPS), the
  full timeline, a self-referential QR code, and print/download-PDF.
- **Documents** — shipping label (barcode + QR), invoice, and receipt, each a
  print-ready page (browser print → PDF); the tracking page doubles as the
  printable tracking summary.
- **Admin panel** (`/admin`, admin role required) — platform stats, full
  management of users (role changes), shipments, carriers (enable/disable),
  notifications (view + manually send), support tickets (reply, status), a
  tracking-event editor (add checkpoints, change status/location/delivery
  date, notes, proof-of-delivery upload, mark delivered, generate a customer
  notification), reports with CSV/Excel export, and an activity-log audit
  trail.
- **Notifications** — header bell with unread badge, a full notifications
  page with a simulated email preview per notification, and per-type
  notification preferences on the profile page.
- **Profile** — Profile / Security (password-reset email) / Notifications /
  API Keys (demo) / Billing (demo) tabs.
- **Global search** (header icon or Cmd/Ctrl+K) — searches tracking #,
  shipment #, reference #, sender/receiver name, and carrier; scoped to the
  signed-in user's own shipments, or all shipments for admins.
- **Extras** — dark/light mode, skeleton loaders, empty states, toast
  notifications, mobile-first responsive layout throughout.

## Carrier logos

`public/carriers/` is the source of truth for which carriers the app shows
anywhere — not just their logo image, but whether the carrier appears at all
in dropdowns, filters, the landing page grid, etc. Only `default.svg` ships
by default (a neutral generic package icon, used as the fallback); no
per-carrier logo files are included on purpose — this repo contains no
third-party trademarks.

How it works:

- `scripts/generate-supported-carriers.mjs` scans `public/carriers/` and
  writes `src/lib/data/supported-carrier-slugs.generated.ts` (a plain array
  of filenames present, minus `default.svg`). It runs automatically via
  `predev`/`prebuild` in `package.json`, so it's always fresh for
  `npm run dev` and `npm run build` — no manual step.
- `src/lib/data/carrier-logos.ts` — `carrierLogoSlugs` maps each carrier
  `code` to its expected filename slug (e.g. `DHL` → `dhl`), and
  `isCarrierLogoAvailable(code)` checks that slug against the generated
  list. `GENERIC` (TrackNova Direct) is always available — its logo *is*
  `default.svg`, which always ships.
- `src/lib/data/carriers.ts` — `CARRIERS` (the full 20-carrier catalog,
  filtered to only those with `isCarrierLogoAvailable`) is what every
  dropdown, filter, and the landing page grid actually renders. Add a logo
  file with zero code changes and that carrier appears everywhere on the
  next dev/build; remove the file and it disappears everywhere, with no
  broken references (the landing page shows a "coming soon" empty state if
  the list is ever fully empty).
- `src/components/shared/carrier-logo.tsx` — `<CarrierLogo carrier="DHL" />`.
  Resolves by carrier code or name, renders SVGs as a plain `<img>` and
  raster formats (png/jpg/webp) through `next/image`, falls back to
  `default.svg` on a failed image load, and is used throughout: the landing
  page, shipment form, shipment detail/list (dashboard + admin), tracking
  page, printable documents, dashboard activity, and global search.

To add a new carrier: drop its logo into `public/carriers/` (filename must
match the slug in `carrierLogoSlugs`), and if it's not one of the 20 already
defined, add one line to `carrierLogoSlugs` and one entry to the carrier
catalog in `src/lib/data/carriers.ts`. Nothing else needs to change.

## Project structure

```
scripts/          generate-supported-carriers.mjs (predev/prebuild hook)
src/
  app/            Next.js App Router routes (marketing, auth, dashboard, admin, track)
  components/     UI components grouped by feature area
  context/        Auth context (Firebase Authentication)
  lib/data/       Carrier catalog + logo mapping, tracking-number generator, countries
  lib/services/   Firestore data access (shipments, users, notifications, tickets, carriers, activity)
  lib/validation/ Zod schemas
  lib/utils/      CSV/Excel export, CSV bulk-import parser
  types/          Shared TypeScript types
```

## Database structure (collections)

`users`, `shipments`, `shipment_tracking`, `tracking_lookup`,
`shipment_lookup`, `reference_lookup`, `tracking_events`, `notifications`,
`support_tickets`, `carrier_settings`, `activity_logs`.

## Build

```bash
npm run build
npm run lint
```

Deploys cleanly to Vercel — set the six required `NEXT_PUBLIC_FIREBASE_*`
environment variables (see `.env.local.example`) in the Vercel project
settings before deploying, since there is no fallback mode without them.
