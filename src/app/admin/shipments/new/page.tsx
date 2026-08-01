"use client";

import { ShipmentForm } from "@/components/shipments/shipment-form";

export default function AdminNewShipmentPage() {
  return <ShipmentForm redirectBase="/admin/shipments" />;
}
