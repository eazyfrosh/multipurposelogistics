import { getAll, getOne, queryByField, remove, upsert } from "@/lib/services/store";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { generateId, generateVerificationToken } from "@/lib/utils";
import { generateShipmentNumber, generateTrackingNumber } from "@/lib/data/tracking-number";
import { logActivity } from "@/lib/services/activity";
import { pushNotification } from "@/lib/services/notifications";
import type { ContactInfo, PackageInfo, ServiceType, Shipment, ShipmentStatus, TrackingEvent } from "@/types";

const SHIPMENTS = "shipments";
const EVENTS = "tracking_events";
const PUBLIC_MIRROR = "shipment_tracking";
const TRACKING_LOOKUP = "tracking_lookup";
const SHIPMENT_LOOKUP = "shipment_lookup";
const REFERENCE_LOOKUP = "reference_lookup";

/**
 * The public-safe subset of a shipment, mirrored into a separate collection
 * so /track/[id] never needs read access to the private `shipments`
 * collection (which holds full sender/receiver emails, phones, addresses).
 */
export interface PublicShipmentSummary {
  id: string;
  trackingNumber: string;
  shipmentNumber: string;
  referenceNumber?: string;
  carrierCode: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  estimatedDeliveryDate: string;
  weightKg: number;
  sender: { name: string; city: string; country: string };
  receiver: { name: string; city: string; country: string };
}

function toPublicSummary(s: Shipment): PublicShipmentSummary {
  return {
    id: s.id,
    trackingNumber: s.trackingNumber,
    shipmentNumber: s.shipmentNumber,
    referenceNumber: s.referenceNumber,
    carrierCode: s.carrierCode,
    status: s.status,
    serviceType: s.serviceType,
    estimatedDeliveryDate: s.estimatedDeliveryDate,
    weightKg: s.package.weightKg,
    sender: { name: s.sender.name, city: s.sender.city, country: s.sender.country },
    receiver: { name: s.receiver.name, city: s.receiver.city, country: s.receiver.country },
  };
}

/** Keeps the public mirror + capability-lookup docs in sync with a shipment. */
async function syncPublicMirror(shipment: Shipment) {
  await upsert(PUBLIC_MIRROR, toPublicSummary(shipment));
  await upsert(TRACKING_LOOKUP, { id: shipment.trackingNumber, shipmentId: shipment.id });
  await upsert(SHIPMENT_LOOKUP, { id: shipment.shipmentNumber, shipmentId: shipment.id });
  if (shipment.referenceNumber) {
    await upsert(REFERENCE_LOOKUP, { id: shipment.referenceNumber, shipmentId: shipment.id });
  }
}

export interface CreateShipmentInput {
  userId: string;
  carrierCode: string;
  serviceType: ServiceType;
  sender: ContactInfo;
  receiver: ContactInfo;
  package: PackageInfo;
  referenceNumber?: string;
  specialInstructions?: string;
  estimatedDeliveryDate: string;
  shippingCost: number;
  insured: boolean;
  insuranceValue?: number;
}

export async function createShipment(input: CreateShipmentInput, actorName: string): Promise<Shipment> {
  const now = new Date().toISOString();
  const shipment: Shipment = {
    id: generateId("shp_"),
    shipmentNumber: generateShipmentNumber(),
    trackingNumber: generateTrackingNumber(input.carrierCode),
    referenceNumber: input.referenceNumber,
    carrierCode: input.carrierCode,
    status: "pending",
    serviceType: input.serviceType,
    sender: input.sender,
    receiver: input.receiver,
    package: input.package,
    specialInstructions: input.specialInstructions,
    estimatedDeliveryDate: input.estimatedDeliveryDate,
    shippingCost: input.shippingCost,
    insured: input.insured,
    insuranceValue: input.insuranceValue,
    attachments: [],
    verificationToken: generateVerificationToken(),
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
  };
  await upsert(SHIPMENTS, shipment);
  await syncPublicMirror(shipment);
  await addTrackingEvent(shipment.id, {
    status: "pending",
    location: input.sender.city + ", " + input.sender.country,
    description: "Shipment created and awaiting carrier pickup.",
  });
  await logActivity(input.userId, actorName, "shipment_created", "shipment", shipment.id, `Created shipment ${shipment.shipmentNumber}`);
  await pushNotification({
    userId: input.userId,
    shipmentId: shipment.id,
    type: "shipment_created",
    title: "Shipment created",
    message: `Your shipment ${shipment.trackingNumber} has been created and is awaiting pickup.`,
  });
  return shipment;
}

export async function getShipment(id: string) {
  return getOne<Shipment>(SHIPMENTS, id);
}

export async function getAllShipments() {
  return getAll<Shipment>(SHIPMENTS);
}

export async function getShipmentsByUser(userId: string) {
  return queryByField<Shipment>(SHIPMENTS, "userId", userId);
}

export async function findShipment(query: string): Promise<Shipment | null> {
  const q = query.trim().toUpperCase();
  if (!q) return null;
  const all = await getAllShipments();
  return (
    all.find(
      (s) =>
        s.trackingNumber.toUpperCase() === q ||
        s.shipmentNumber.toUpperCase() === q ||
        (s.referenceNumber && s.referenceNumber.toUpperCase() === q)
    ) ?? null
  );
}

/**
 * Public, no-sign-in lookup for the /track search page. In demo mode this
 * scans local shipments directly (no security boundary there). Against real
 * Firestore it only ever reads the narrow, get-by-exact-key lookup mirrors —
 * never the private `shipments` collection — so an anonymous visitor can
 * resolve a tracking/shipment/reference number to an id without ever being
 * able to list or browse other people's shipments.
 */
export async function findShipmentPublic(query: string): Promise<{ id: string } | null> {
  const q = query.trim();
  if (!q) return null;

  if (!isFirebaseConfigured) {
    const match = await findShipment(q);
    return match ? { id: match.id } : null;
  }

  const candidates = Array.from(new Set([q, q.toUpperCase()]));
  for (const collection of [TRACKING_LOOKUP, SHIPMENT_LOOKUP, REFERENCE_LOOKUP]) {
    for (const value of candidates) {
      const hit = await getOne<{ id: string; shipmentId: string }>(collection, value);
      if (hit) return { id: hit.shipmentId };
    }
  }
  return null;
}

export async function getPublicShipmentSummary(id: string) {
  return getOne<PublicShipmentSummary>(PUBLIC_MIRROR, id);
}

export async function updateShipment(shipment: Shipment) {
  const updated = { ...shipment, updatedAt: new Date().toISOString() };
  await upsert(SHIPMENTS, updated);
  await syncPublicMirror(updated);
  return updated;
}

export async function deleteShipment(id: string) {
  await remove(SHIPMENTS, id);
  const events = await getTrackingEvents(id);
  await Promise.all(events.map((e) => remove(EVENTS, e.id)));
}

export interface AddEventInput {
  status: ShipmentStatus;
  location: string;
  description: string;
  notes?: string;
  proofOfDeliveryUrl?: string;
  createdBy?: string;
  timestamp?: string;
}

export async function addTrackingEvent(shipmentId: string, input: AddEventInput): Promise<TrackingEvent> {
  const event: TrackingEvent = {
    id: generateId("evt_"),
    shipmentId,
    status: input.status,
    location: input.location,
    description: input.description,
    notes: input.notes,
    proofOfDeliveryUrl: input.proofOfDeliveryUrl,
    timestamp: input.timestamp ?? new Date().toISOString(),
    createdBy: input.createdBy,
  };
  await upsert(EVENTS, event);
  return event;
}

export async function getTrackingEvents(shipmentId: string) {
  const events = await queryByField<TrackingEvent>(EVENTS, "shipmentId", shipmentId);
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export const STATUS_DESCRIPTIONS: Record<ShipmentStatus, string> = {
  pending: "Shipment created and awaiting carrier pickup.",
  processing: "Shipment is being processed at the origin facility.",
  picked_up: "Package picked up by carrier.",
  in_transit: "Package is in transit to the next facility.",
  arrived_at_hub: "Package arrived at a regional sorting hub.",
  customs_clearance: "Package is undergoing customs clearance.",
  out_for_delivery: "Package is out for delivery.",
  delivered: "Package delivered successfully.",
  failed_delivery: "Delivery attempt failed.",
  returned: "Package returned to sender.",
  cancelled: "Shipment was cancelled.",
};
