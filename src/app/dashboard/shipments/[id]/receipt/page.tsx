"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { DocumentLayout } from "@/components/shipments/document-layout";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { QRCodeImage } from "@/components/shared/qr-code";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getShipment } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { SERVICE_LABELS, type Shipment } from "@/types";

function ReceiptContent() {
  const params = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined);

  useEffect(() => {
    getShipment(params.id).then((s) => {
      if (!s || (s.userId !== user?.uid && profile?.role !== "admin")) {
        setShipment(null);
        return;
      }
      setShipment(s);
    });
  }, [params.id, user, profile]);

  if (shipment === undefined) return <LoadingState label="Loading receipt…" />;
  if (!shipment) return <div className="py-16 text-center text-foreground/60">Shipment not found.</div>;

  const carrier = getCarrier(shipment.carrierCode);

  return (
    <DocumentLayout title="Shipment receipt">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircle2 size={26} />
        </span>
        <h2 className="mt-3 text-xl font-bold">Shipment confirmed</h2>
        <p className="text-sm text-foreground/55">Thank you for shipping with {carrier.name} via TrackNova.</p>
        <div className="mt-3">
          <CarrierLogo carrier={shipment.carrierCode} size={40} />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 border-y border-dashed border-black/15 py-6 dark:border-white/20">
        <QRCodeImage value={shipment.trackingNumber} size={120} />
        <p className="font-mono text-lg font-semibold">{shipment.trackingNumber}</p>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">Shipment #</dt>
          <dd className="font-medium">{shipment.shipmentNumber}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">Date</dt>
          <dd className="font-medium">{formatDateLong(shipment.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">Service</dt>
          <dd className="font-medium">{SERVICE_LABELS[shipment.serviceType]}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">Amount paid</dt>
          <dd className="font-medium">{formatCurrency(shipment.shippingCost)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">From</dt>
          <dd className="font-medium">{shipment.sender.name}, {shipment.sender.city}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-foreground/40">To</dt>
          <dd className="font-medium">{shipment.receiver.name}, {shipment.receiver.city}</dd>
        </div>
      </dl>
    </DocumentLayout>
  );
}

export default function ReceiptPage() {
  return <ReceiptContent />;
}
