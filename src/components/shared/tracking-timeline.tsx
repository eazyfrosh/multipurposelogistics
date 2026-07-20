import {
  CircleDot,
  Truck,
  Warehouse,
  ShieldAlert,
  Home,
  CheckCircle2,
  XCircle,
  Undo2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ShipmentStatus, TrackingEvent } from "@/types";

const STATUS_ICONS: Record<ShipmentStatus, typeof CircleDot> = {
  pending: CircleDot,
  processing: Warehouse,
  picked_up: Truck,
  in_transit: Truck,
  arrived_at_hub: Warehouse,
  customs_clearance: ShieldAlert,
  out_for_delivery: Home,
  delivered: CheckCircle2,
  failed_delivery: XCircle,
  returned: Undo2,
  cancelled: XCircle,
};

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  if (events.length === 0) {
    return <p className="py-8 text-center text-sm text-foreground/50">No tracking events yet.</p>;
  }

  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <ol className="relative space-y-6 border-l-2 border-dashed border-black/10 pl-6 dark:border-white/15">
      {sorted.map((event, i) => {
        const Icon = STATUS_ICONS[event.status] ?? CircleDot;
        const isLatest = i === 0;
        return (
          <li key={event.id} className="relative">
            <span
              className={`absolute -left-[31px] flex h-7 w-7 items-center justify-center rounded-full border-2 ${
                isLatest
                  ? "border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                  : "border-black/15 bg-white text-foreground/50 dark:border-white/20 dark:bg-[#0b0e17]"
              }`}
            >
              <Icon size={13} />
            </span>
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="font-medium">{event.description}</p>
                <p className="text-xs text-foreground/45">{formatDateTime(event.timestamp)}</p>
              </div>
              <p className="text-sm text-foreground/55">{event.location}</p>
              {event.notes && <p className="mt-1 text-sm text-foreground/50 italic">&ldquo;{event.notes}&rdquo;</p>}
              {event.proofOfDeliveryUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={event.proofOfDeliveryUrl}
                  alt="Proof of delivery"
                  className="mt-2 h-24 w-24 rounded-lg object-cover"
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
