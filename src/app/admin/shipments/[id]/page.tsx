"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ImagePlus, PlusCircle, CalendarClock } from "lucide-react";
import { StatusBadge, statusProgressPercent } from "@/components/shared/status-badge";
import { TrackingTimeline } from "@/components/shared/tracking-timeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth-context";
import {
  addTrackingEvent,
  getShipment,
  getTrackingEvents,
  STATUS_DESCRIPTIONS,
  updateShipment,
} from "@/lib/services/shipments";
import { pushNotification } from "@/lib/services/notifications";
import { logActivity } from "@/lib/services/activity";
import { getCarrier } from "@/lib/data/carriers";
import { formatDateLong } from "@/lib/utils";
import { NOTIFICATION_COPY } from "@/lib/data/notification-copy";
import { SHIPMENT_STATUSES, STATUS_LABELS, type Shipment, type ShipmentStatus, type TrackingEvent } from "@/types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AdminShipmentEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [shipment, setShipment] = useState<Shipment | null | undefined>(undefined);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  const [status, setStatus] = useState<ShipmentStatus>("pending");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<string | undefined>();
  const [notify, setNotify] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");

  async function load() {
    const s = await getShipment(params.id);
    setShipment(s);
    if (s) {
      setEvents(await getTrackingEvents(s.id));
      setStatus(s.status);
      setDeliveryDate(s.estimatedDeliveryDate?.slice(0, 10) ?? "");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  useEffect(() => {
    setDescription(STATUS_DESCRIPTIONS[status] ?? "");
  }, [status]);

  if (shipment === undefined) return <LoadingState label="Loading shipment…" />;
  if (shipment === null) {
    return (
      <div className="py-16 text-center text-foreground/60">
        Shipment not found.
      </div>
    );
  }

  const carrier = getCarrier(shipment.carrierCode);
  const actorName = profile?.displayName ?? user?.email ?? "Admin";

  async function submitEvent(e: FormEvent) {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      toast.error("Location and description are required");
      return;
    }
    setSubmitting(true);
    try {
      await addTrackingEvent(shipment!.id, {
        status,
        location: location.trim(),
        description: description.trim(),
        notes: notes.trim() || undefined,
        proofOfDeliveryUrl: proofFile,
        createdBy: actorName,
      });
      await updateShipment({ ...shipment!, status });
      await logActivity(user!.uid, actorName, "event_added", "shipment", shipment!.id, `Added "${STATUS_LABELS[status]}" event to ${shipment!.trackingNumber}`);

      if (notify) {
        const copy = NOTIFICATION_COPY[status];
        await pushNotification({
          userId: shipment!.userId,
          shipmentId: shipment!.id,
          type: copy.type,
          title: copy.title,
          message: copy.message(shipment!.trackingNumber, location.trim()),
        });
      }

      toast.success("Tracking event added");
      setLocation("");
      setNotes("");
      setProofFile(undefined);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function markDelivered() {
    setSubmitting(true);
    try {
      await addTrackingEvent(shipment!.id, {
        status: "delivered",
        location: shipment!.receiver.city + ", " + shipment!.receiver.country,
        description: STATUS_DESCRIPTIONS.delivered,
        createdBy: actorName,
      });
      await updateShipment({ ...shipment!, status: "delivered" });
      await logActivity(user!.uid, actorName, "status_updated", "shipment", shipment!.id, `Marked ${shipment!.trackingNumber} delivered`);
      const copy = NOTIFICATION_COPY.delivered;
      await pushNotification({
        userId: shipment!.userId,
        shipmentId: shipment!.id,
        type: copy.type,
        title: copy.title,
        message: copy.message(shipment!.trackingNumber, shipment!.receiver.city),
      });
      toast.success("Shipment marked delivered");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function saveDeliveryDate() {
    if (!deliveryDate) return;
    await updateShipment({ ...shipment!, estimatedDeliveryDate: deliveryDate });
    if (user) {
      await logActivity(user.uid, actorName, "shipment_updated", "shipment", shipment!.id, `Changed delivery date for ${shipment!.trackingNumber}`);
    }
    toast.success("Delivery date updated");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <carrier.icon size={18} className="text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-bold">{shipment.trackingNumber}</h1>
            <StatusBadge status={shipment.status} />
          </div>
          <p className="mt-1 text-sm text-foreground/55">{shipment.shipmentNumber} · {carrier.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/track/${shipment.id}`)}>
            View public page
          </Button>
          {shipment.status !== "delivered" && (
            <Button size="sm" onClick={markDelivered} disabled={submitting}>
              <CheckCircle2 size={14} /> Mark delivered
            </Button>
          )}
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
              <CardTitle className="flex items-center gap-2"><CalendarClock size={16} /> Delivery date</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              <Button size="sm" variant="secondary" onClick={saveDeliveryDate}>Save</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PlusCircle size={16} /> Add tracking event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEvent} className="space-y-3">
                <div>
                  <Label>Status</Label>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus)}>
                    {SHIPMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Memphis Hub, TN" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div>
                  <Label>Internal notes (optional)</Label>
                  <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible to customer on the timeline" />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5"><ImagePlus size={13} /> Proof of delivery (optional)</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) setProofFile(await readFileAsDataUrl(file));
                    }}
                    className="w-full text-xs text-foreground/60"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 rounded" />
                  Generate notification for customer
                </label>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding…" : "Add event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminShipmentPage() {
  return <AdminShipmentEditor />;
}
