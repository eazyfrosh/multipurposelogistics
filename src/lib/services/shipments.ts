import { getAll, getOne, queryByField, remove, upsert } from "@/lib/services/store";
import { generateId, generateVerificationToken } from "@/lib/utils";
import { generateShipmentNumber, generateTrackingNumber } from "@/lib/data/tracking-number";
import { logActivity } from "@/lib/services/activity";
import { pushNotification } from "@/lib/services/notifications";
import type { ContactInfo, PackageInfo, ServiceType, Shipment, ShipmentStatus, TrackingEvent } from "@/types";

const SHIPMENTS = "shipments";
const EVENTS = "tracking_events";

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

export async function updateShipment(shipment: Shipment) {
  const updated = { ...shipment, updatedAt: new Date().toISOString() };
  await upsert(SHIPMENTS, updated);
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
