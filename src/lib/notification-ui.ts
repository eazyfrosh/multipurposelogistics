import type { BadgeTone } from "@/components/ui/badge";
import type { NotificationType } from "@/types";

export const NOTIFICATION_TONE: Record<NotificationType, BadgeTone> = {
  shipment_created: "brand",
  picked_up: "brand",
  in_transit: "brand",
  delayed: "amber",
  out_for_delivery: "gold",
  delivered: "green",
  returned: "red",
  system: "neutral",
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  shipment_created: "Shipment created",
  picked_up: "Picked up",
  in_transit: "In transit",
  delayed: "Delayed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
  system: "System",
};
