"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { SHIPMENT_STATUSES, STATUS_LABELS, type ShipmentStatus } from "@/types";

export function BulkStatusDialog({
  open,
  onClose,
  count,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  onApply: (status: ShipmentStatus) => Promise<void>;
}) {
  const [status, setStatus] = useState<ShipmentStatus>("in_transit");
  const [applying, setApplying] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} title={`Update status for ${count} shipment${count === 1 ? "" : "s"}`}>
      <div className="space-y-4">
        <div>
          <Label>New status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus)}>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={applying}
            onClick={async () => {
              setApplying(true);
              try {
                await onApply(status);
                toast.success("Status updated");
                onClose();
              } finally {
                setApplying(false);
              }
            }}
          >
            {applying ? "Applying…" : "Apply"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
