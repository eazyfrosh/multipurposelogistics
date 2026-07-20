"use client";

import { ProtectedRoute } from "@/components/shared/protected-route";
import { ShipmentForm } from "@/components/shipments/shipment-form";

export default function NewShipmentPage() {
  return (
    <ProtectedRoute>
      <ShipmentForm />
    </ProtectedRoute>
  );
}
