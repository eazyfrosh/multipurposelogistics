import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { formatDateTime } from "@/lib/utils";
import type { TrackingEvent } from "@/types";

export interface ActivityItem extends TrackingEvent {
  trackingNumber: string;
  carrierCode: string;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState icon={<Activity size={20} />} title="No activity yet" description="Tracking events will appear here as your shipments move." />
        ) : (
          <ul className="divide-y divide-black/6 dark:divide-white/8">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <CarrierLogo carrier={item.carrierCode} size={26} bare className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link href={`/dashboard/shipments/${item.shipmentId}`} className="truncate text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {item.trackingNumber}
                  </Link>
                  <p className="truncate text-sm text-foreground/60">{item.description}</p>
                  <p className="text-xs text-foreground/40">{formatDateTime(item.timestamp)}</p>
                </div>
                <StatusBadge status={item.status} className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
