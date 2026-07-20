"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DocumentLayout } from "@/components/shipments/document-layout";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getShipment } from "@/lib/services/shipments";
import { getCarrier } from "@/lib/data/carriers";
import { formatCurrency, formatDateLong } from "@/lib/utils";
import { SERVICE_LABELS, type Shipment } from "@/types";

function InvoiceContent() {
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

  if (shipment === undefined) return <LoadingState label="Loading invoice…" />;
  if (!shipment) return <div className="py-16 text-center text-foreground/60">Shipment not found.</div>;

  const carrier = getCarrier(shipment.carrierCode);
  const insuranceCost = shipment.insured ? (shipment.insuranceValue ?? 0) * 0.01 : 0;
  const total = shipment.shippingCost + insuranceCost;

  return (
    <DocumentLayout title="Invoice">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/40">Invoice for</p>
          <p className="text-lg font-semibold">{shipment.sender.name}</p>
          <p className="text-sm text-foreground/60">{shipment.sender.email}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-foreground/40">Invoice #</p>
          <p className="font-medium">{shipment.shipmentNumber}</p>
          <p className="mt-1 text-xs text-foreground/45">{formatDateLong(shipment.createdAt)}</p>
        </div>
      </div>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-foreground/40 dark:border-white/10">
            <th className="pb-2">Description</th>
            <th className="pb-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/6 dark:divide-white/8">
          <tr>
            <td className="py-3">
              {carrier.name} — {SERVICE_LABELS[shipment.serviceType]} shipping
              <p className="text-xs text-foreground/45">Tracking {shipment.trackingNumber}</p>
            </td>
            <td className="py-3 text-right">{formatCurrency(shipment.shippingCost)}</td>
          </tr>
          {shipment.insured && (
            <tr>
              <td className="py-3">Shipment insurance ({formatCurrency(shipment.insuranceValue ?? 0)} coverage)</td>
              <td className="py-3 text-right">{formatCurrency(insuranceCost)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-48 space-y-1 text-sm">
          <div className="flex justify-between text-foreground/60">
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-1 text-base font-bold dark:border-white/10">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <p className="mt-8 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
        Paid (demo)
      </p>
    </DocumentLayout>
  );
}

export default function InvoicePage() {
  return <InvoiceContent />;
}
