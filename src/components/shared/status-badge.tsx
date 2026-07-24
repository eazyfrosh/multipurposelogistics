import { Badge, type BadgeTone } from "@/components/ui/badge";
import { STATUS_LABELS, type ShipmentStatus } from "@/types";

const STATUS_TONES: Record<ShipmentStatus, BadgeTone> = {
  pending: "neutral",
  processing: "blue",
  picked_up: "blue",
  in_transit: "brand",
  arrived_at_hub: "brand",
  customs_clearance: "amber",
  out_for_delivery: "gold",
  delivered: "green",
  failed_delivery: "red",
  returned: "red",
  cancelled: "red",
};

// Statuses that represent the carrier actively handling the shipment — these
// pick up the carrier's theme color when carrierAware is on. Delivered/
// failed/returned/cancelled/customs keep their semantic green/red/amber so
// "good vs. bad outcome" stays instantly recognizable regardless of carrier.
const CARRIER_TONE_STATUSES = new Set<ShipmentStatus>([
  "processing",
  "picked_up",
  "in_transit",
  "arrived_at_hub",
  "out_for_delivery",
]);

export function StatusBadge({
  status,
  className,
  carrierAware = false,
}: {
  status: ShipmentStatus;
  className?: string;
  carrierAware?: boolean;
}) {
  const tone = carrierAware && CARRIER_TONE_STATUSES.has(status) ? "carrier" : STATUS_TONES[status];
  return (
    <Badge tone={tone} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function statusProgressPercent(status: ShipmentStatus): number {
  const order: ShipmentStatus[] = [
    "pending",
    "processing",
    "picked_up",
    "in_transit",
    "arrived_at_hub",
    "customs_clearance",
    "out_for_delivery",
    "delivered",
  ];
  if (status === "cancelled" || status === "returned" || status === "failed_delivery") return 100;
  const idx = order.indexOf(status);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / order.length) * 100);
}
