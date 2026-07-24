"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Printer, Copy, MapPin, Weight, Package as PackageIcon } from "lucide-react";
import { StatusBadge, statusProgressPercent } from "@/components/shared/status-badge";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { CarrierThemeScope } from "@/components/shared/carrier-theme-scope";
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
    <CarrierThemeScope carrierCode={carrier.code} className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4 no-print">
        <div>
          <p className="text-sm text-foreground/50">Tracking number</p>
          <h1 className="text-2xl font-bold">{shipment.trackingNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="carrier-outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success("Link copied");
            }}
          >
            <Copy size={14} /> Copy link
          </Button>
          <Button variant="carrier" size="sm" onClick={() => window.print()}>
            <Printer size={14} /> Print / Download PDF
          </Button>
        </div>
      </div>

      <Card className="mt-6 overflow-hidden border-[color-mix(in_srgb,var(--carrier-primary)_20%,transparent)] p-0 shadow-[0_1px_2px_color-mix(in_srgb,var(--carrier-primary)_10%,transparent)]">
        <div className="bg-[linear-gradient(135deg,var(--carrier-primary),var(--carrier-secondary))] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CarrierLogo carrier={shipment.carrierCode} size={44} className="shadow-lg" />
              <div>
                <p className="text-sm text-[var(--carrier-on-primary)]/80">
                  {carrier.name} · {SERVICE_LABELS[shipment.serviceType]}
                </p>
                {/* The "carrier" tone assumes a neutral page background — it'd nearly
                    vanish on top of the gradient header, which is already the carrier's
                    own color. Override with a frosted on-primary chip instead. */}
                <StatusBadge
                  status={shipment.status}
                  carrierAware
                  className="mt-1 bg-[color-mix(in_srgb,var(--carrier-on-primary)_20%,transparent)] text-[var(--carrier-on-primary)]"
                />
              </div>
            </div>
            <div className="text-right text-[var(--carrier-on-primary)]">
              <p className="text-sm opacity-80">Estimated delivery</p>
              <p className="font-semibold">{formatDateLong(shipment.estimatedDeliveryDate)}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Progress value={statusProgressPercent(shipment.status)} tone="carrier" />
          {latestEvent && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-foreground/60">
              <MapPin size={14} className="text-[var(--carrier-primary-text)]" /> Last known location:{" "}
              <span className="font-medium text-foreground">{latestEvent.location}</span>
            </p>
          )}
        </div>
      </Card>

      <Card className="mt-6 border-[color-mix(in_srgb,var(--carrier-primary)_16%,transparent)] p-6">
        <h2 className="mb-3 text-sm font-semibold">Route overview</h2>
        <RouteMapPlaceholder events={events} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-[color-mix(in_srgb,var(--carrier-primary)_16%,transparent)]">
            <CardHeader>
              <CardTitle>Tracking history</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline events={events} carrierAware />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-[color-mix(in_srgb,var(--carrier-primary)_16%,transparent)]">
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

          <Card className="no-print border-[color-mix(in_srgb,var(--carrier-primary)_16%,transparent)]">
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
    </CarrierThemeScope>
  );
}

export default function TrackResultPage() {
  return <TrackingResult />;
}
