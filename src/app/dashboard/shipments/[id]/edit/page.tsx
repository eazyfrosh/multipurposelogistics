"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import { getShipment } from "@/lib/services/shipments";
import type { Shipment } from "@/types";

function EditShipmentInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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

  useEffect(() => {
    if (shipment === null) router.replace("/dashboard/shipments");
  }, [shipment, router]);

  if (!shipment) return <LoadingState label="Loading shipment…" />;

  // Own shipment stays in the customer-facing dashboard; an admin editing
  // someone else's shipment lands back in the admin section after saving.
  const redirectBase = shipment.userId === user?.uid ? "/dashboard/shipments" : "/admin/shipments";

  return <ShipmentForm existing={shipment} redirectBase={redirectBase} />;
}

export default function EditShipmentPage() {
  return <EditShipmentInner />;
}
