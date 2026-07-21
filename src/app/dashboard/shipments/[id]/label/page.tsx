"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DocumentLayout } from "@/components/shipments/document-layout";
import { Barcode } from "@/components/shared/barcode";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { QRCodeImage } from "@/components/shared/qr-code";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getShipment } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { SERVICE_LABELS, type Shipment } from "@/types";

function AddressBlock({ label, name, address, city, country, postalCode }: { label: string; name: string; address: string; city: string; country: string; postalCode: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground/40">{label}</p>
      <p className="mt-1 text-lg font-semibold">{name}</p>
      <p className="text-sm text-foreground/70">{address}</p>
      <p className="text-sm text-foreground/70">{city}, {country} {postalCode}</p>
    </div>
  );
}

function LabelContent() {
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

  if (shipment === undefined) return <LoadingState label="Loading label…" />;
  if (!shipment) return <div className="py-16 text-center text-foreground/60">Shipment not found.</div>;

  const carrier = getCarrier(shipment.carrierCode);

  return (
    <DocumentLayout title="Shipping label">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          <CarrierLogo carrier={shipment.carrierCode} size={44} />
          <div>
            <p className="text-lg font-bold">{carrier.name}</p>
            <p className="text-sm text-foreground/55">{SERVICE_LABELS[shipment.serviceType]} service</p>
          </div>
        </div>
        <QRCodeImage value={shipment.trackingNumber} size={90} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-8 border-y border-dashed border-black/15 py-6 dark:border-white/20">
        <AddressBlock label="From" {...shipment.sender} />
        <AddressBlock label="To" {...shipment.receiver} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/40">Weight</p>
          <p className="font-medium">{shipment.package.weightKg} kg</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/40">Dimensions</p>
          <p className="font-medium">{shipment.package.lengthCm}×{shipment.package.widthCm}×{shipment.package.heightCm} cm</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/40">Shipment #</p>
          <p className="font-medium">{shipment.shipmentNumber}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <Barcode value={shipment.trackingNumber} className="h-16 w-full max-w-md text-black" />
      </div>
    </DocumentLayout>
  );
}

export default function ShippingLabelPage() {
  return <LabelContent />;
}
