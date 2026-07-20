"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Link2, Copy, MapPin, Weight, Ruler, ShieldCheck } from "lucide-react";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { StatusBadge, statusProgressPercent } from "@/components/shared/status-badge";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { QRCodeImage } from "@/components/shared/qr-code";
import { Barcode } from "@/components/shared/barcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getShipment, getTrackingEvents } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { SERVICE_LABELS, type Shipment, type TrackingEvent } from "@/types";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-foreground/40">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function ShipmentDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    getShipment(params.id).then(async (s) => {
      if (!s || (s.userId !== user?.uid && profile?.role !== "admin")) {
        setShipment(null);
        return;
      }
      setShipment(s);
      setEvents(await getTrackingEvents(s.id));
    });
  }, [params.id, user, profile]);

  useEffect(() => {
    if (shipment === null) router.replace("/dashboard/shipments");
  }, [shipment, router]);

  if (!shipment) return <LoadingState label="Loading shipment…" />;

  const carrier = getCarrier(shipment.carrierCode);
  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/track/${shipment.id}` : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <carrier.icon size={18} className="text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold">{shipment.trackingNumber}</h1>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="mt-1 text-sm text-foreground/55">
            {shipment.shipmentNumber} · {carrier.name} · {SERVICE_LABELS[shipment.serviceType]}
            {shipment.referenceNumber && ` · Ref ${shipment.referenceNumber}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/track/${shipment.id}`} target="_blank">
            <Button variant="outline" size="sm">
              <Link2 size={14} /> Public tracking page
            </Button>
          </Link>
          <Link href={`/dashboard/shipments/${shipment.id}/edit`}>
            <Button size="sm">
              <Pencil size={14} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Delivery progress</span>
          <span className="text-foreground/55">Est. {formatDateLong(shipment.estimatedDeliveryDate)}</span>
        </div>
        <Progress value={statusProgressPercent(shipment.status)} className="mt-3" />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sender &amp; receiver</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/45">
                  <MapPin size={12} /> Sender
                </p>
                <p className="text-sm font-medium">{shipment.sender.name}</p>
                <p className="text-sm text-foreground/60">{shipment.sender.address}</p>
                <p className="text-sm text-foreground/60">
                  {shipment.sender.city}, {shipment.sender.country} {shipment.sender.postalCode}
                </p>
                <p className="mt-1 text-sm text-foreground/60">{shipment.sender.email}</p>
                <p className="text-sm text-foreground/60">{shipment.sender.phone}</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/45">
                  <MapPin size={12} /> Receiver
                </p>
                <p className="text-sm font-medium">{shipment.receiver.name}</p>
                <p className="text-sm text-foreground/60">{shipment.receiver.address}</p>
                <p className="text-sm text-foreground/60">
                  {shipment.receiver.city}, {shipment.receiver.country} {shipment.receiver.postalCode}
                </p>
                <p className="mt-1 text-sm text-foreground/60">{shipment.receiver.email}</p>
                <p className="text-sm text-foreground/60">{shipment.receiver.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Package &amp; cost</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoRow label="Weight" value={`${shipment.package.weightKg} kg`} />
              <InfoRow
                label="Dimensions"
                value={`${shipment.package.lengthCm}×${shipment.package.widthCm}×${shipment.package.heightCm} cm`}
              />
              <InfoRow label="Package type" value={shipment.package.packageType} />
              <InfoRow label="Shipping cost" value={formatCurrency(shipment.shippingCost)} />
              <InfoRow
                label="Insurance"
                value={shipment.insured ? formatCurrency(shipment.insuranceValue ?? 0) : "Not insured"}
              />
              {shipment.package.description && (
                <div className="col-span-2 sm:col-span-4">
                  <InfoRow label="Description" value={shipment.package.description} />
                </div>
              )}
              {shipment.specialInstructions && (
                <div className="col-span-2 sm:col-span-4">
                  <InfoRow label="Special instructions" value={shipment.specialInstructions} />
                </div>
              )}
            </CardContent>
          </Card>

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
              <CardTitle>QR verification</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <QRCodeImage value={publicUrl || shipment.trackingNumber} size={160} />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("Tracking link copied");
                }}
              >
                <Copy size={14} /> Copy tracking link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barcode</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center overflow-x-auto">
              <Barcode value={shipment.trackingNumber} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Weight size={14} className="text-foreground/40" /> {shipment.package.weightKg} kg
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ruler size={14} className="text-foreground/40" /> {shipment.package.lengthCm}×
                {shipment.package.widthCm}×{shipment.package.heightCm} cm
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={14} className="text-foreground/40" />{" "}
                {shipment.insured ? "Insured" : "Not insured"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentDetailPage() {
  return (
    <ProtectedRoute>
      <ShipmentDetail />
    </ProtectedRoute>
  );
}
