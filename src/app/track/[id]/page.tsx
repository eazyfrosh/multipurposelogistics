"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Printer, Copy, MapPin, Weight, Package as PackageIcon } from "lucide-react";
import { StatusBadge, statusProgressPercent } from "@/components/shared/status-badge";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { RouteMapPlaceholder } from "@/components/tracking/route-map-placeholder";
import { QRCodeImage } from "@/components/shared/qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getPublicShipmentSummary, getTrackingEvents, type PublicShipmentSummary } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { formatDateLong } from "@/lib/utils";
import { SERVICE_LABELS, STATUS_LABELS, type TrackingEvent } from "@/types";

function TrackingResult() {
  const params = useParams<{ id: string }>();
  const [shipment, setShipment] = useState<PublicShipmentSummary | null | undefined>(undefined);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setPublicUrl(window.location.href);
  }, []);

  useEffect(() => {
    getPublicShipmentSummary(params.id).then(async (s) => {
      setShipment(s);
      if (s) setEvents(await getTrackingEvents(s.id));
    });
  }, [params.id]);

  if (shipment === undefined) return <LoadingState label="Loading tracking information…" />;

  if (shipment === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20">
        <EmptyState
          icon={<PackageIcon size={22} />}
          title="Shipment not found"
          description="Check the tracking number and try again from the search page."
        />
      </div>
    );
  }

  const carrier = getCarrier(shipment.carrierCode);
  const latestEvent = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <p className="text-sm text-foreground/50">Tracking number</p>
          <h1 className="text-2xl font-bold">{shipment.trackingNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success("Link copied");
            }}
          >
            <Copy size={14} /> Copy link
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer size={14} /> Print / Download PDF
          </Button>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CarrierLogo carrier={shipment.carrierCode} size={44} />
            <div>
              <p className="text-sm text-foreground/50">{carrier.name} · {SERVICE_LABELS[shipment.serviceType]}</p>
              <StatusBadge status={shipment.status} className="mt-1" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground/50">Estimated delivery</p>
            <p className="font-semibold">{formatDateLong(shipment.estimatedDeliveryDate)}</p>
          </div>
        </div>
        <Progress value={statusProgressPercent(shipment.status)} className="mt-5" />
        {latestEvent && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-foreground/60">
            <MapPin size={14} /> Last known location: <span className="font-medium text-foreground">{latestEvent.location}</span>
          </p>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="mb-3 text-sm font-semibold">Route overview</h2>
        <RouteMapPlaceholder events={events} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tracking history</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/40">Sender</p>
                <p className="font-medium">{shipment.sender.name}</p>
                <p className="text-foreground/55">{shipment.sender.city}, {shipment.sender.country}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-foreground/40">Receiver</p>
                <p className="font-medium">{shipment.receiver.name}</p>
                <p className="text-foreground/55">{shipment.receiver.city}, {shipment.receiver.country}</p>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                <Weight size={13} className="text-foreground/40" />
                <span>{shipment.weightKg} kg · {STATUS_LABELS[shipment.status]}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="no-print">
            <CardHeader>
              <CardTitle>QR verification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <QRCodeImage value={publicUrl || shipment.trackingNumber} size={140} />
              <p className="text-center text-xs text-foreground/45">Scan to open this tracking page on another device.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TrackResultPage() {
  return <TrackingResult />;
}
