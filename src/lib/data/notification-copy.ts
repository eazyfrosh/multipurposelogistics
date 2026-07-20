import type { NotificationType, ShipmentStatus } from "@/types";

interface NotificationCopy {
  type: NotificationType;
  title: string;
  message: (trackingNumber: string, location: string) => string;
}

export const NOTIFICATION_COPY: Record<ShipmentStatus, NotificationCopy> = {
  pending: {
    type: "shipment_created",
    title: "Shipment created",
    message: (t) => `Your shipment ${t} has been created and is awaiting pickup.`,
  },
  processing: {
    type: "system",
    title: "Shipment processing",
    message: (t) => `Your shipment ${t} is being processed at the origin facility.`,
  },
  picked_up: {
    type: "picked_up",
    title: "Package picked up",
    message: (t, l) => `Your shipment ${t} was picked up in ${l}.`,
  },
  in_transit: {
    type: "in_transit",
    title: "Shipment in transit",
    message: (t, l) => `Your shipment ${t} is in transit, last seen in ${l}.`,
  },
  arrived_at_hub: {
    type: "in_transit",
    title: "Arrived at sorting hub",
    message: (t, l) => `Your shipment ${t} arrived at a sorting hub in ${l}.`,
  },
  customs_clearance: {
    type: "delayed",
    title: "Customs clearance",
    message: (t, l) => `Your shipment ${t} is undergoing customs clearance in ${l}.`,
  },
  out_for_delivery: {
    type: "out_for_delivery",
    title: "Out for delivery",
    message: (t, l) => `Your shipment ${t} is out for delivery in ${l}.`,
  },
  delivered: {
    type: "delivered",
    title: "Delivered",
    message: (t, l) => `Your shipment ${t} was delivered in ${l}.`,
  },
  failed_delivery: {
    type: "delayed",
    title: "Delivery attempt failed",
    message: (t, l) => `A delivery attempt for shipment ${t} failed in ${l}. We'll try again.`,
  },
  returned: {
    type: "returned",
    title: "Shipment returned",
    message: (t) => `Your shipment ${t} is being returned to sender.`,
  },
  cancelled: {
    type: "system",
    title: "Shipment cancelled",
    message: (t) => `Your shipment ${t} has been cancelled.`,
  },
};
