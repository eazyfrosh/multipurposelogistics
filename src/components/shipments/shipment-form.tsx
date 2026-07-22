"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Film, ImagePlus, Loader2, PackagePlus, X } from "lucide-react";
import { ContactFields } from "@/components/shipments/contact-fields";
import { CarrierLogo } from "@/components/shared/carrier-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { ALL_CARRIERS } from "@/lib/data/carriers";
import { createShipment, updateShipment } from "@/lib/services/shipments";
import {
  deleteShipmentMedia,
  isAcceptedMediaFile,
  isOversizedMediaFile,
  MAX_MEDIA_FILE_MB,
  uploadShipmentMedia,
} from "@/lib/services/media";
import { generateId, formatFileSize } from "@/lib/utils";
import { shipmentSchema, type ShipmentFormInput, type ShipmentFormValues } from "@/lib/validation/shipment";
import { PACKAGE_TYPES, SERVICE_TYPES, SERVICE_LABELS, type Shipment, type ShipmentAttachment } from "@/types";

function toDateInput(iso: string) {
  return iso ? iso.slice(0, 10) : "";
}

export function ShipmentForm({ existing }: { existing?: Shipment }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(existing);
  const [shipmentId] = useState(() => existing?.id ?? generateId("shp_"));
  const [attachments, setAttachments] = useState<ShipmentAttachment[]>(existing?.attachments ?? []);
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShipmentFormInput, unknown, ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: existing
      ? {
          carrierCode: existing.carrierCode,
          serviceType: existing.serviceType,
          referenceNumber: existing.referenceNumber,
          sender: existing.sender,
          receiver: existing.receiver,
          weightKg: existing.package.weightKg,
          lengthCm: existing.package.lengthCm,
          widthCm: existing.package.widthCm,
          heightCm: existing.package.heightCm,
          packageType: existing.package.packageType,
          description: existing.package.description,
          specialInstructions: existing.specialInstructions,
          estimatedDeliveryDate: toDateInput(existing.estimatedDeliveryDate),
          shippingCost: existing.shippingCost,
          insured: existing.insured,
          insuranceValue: existing.insuranceValue,
        }
      : {
          carrierCode: ALL_CARRIERS[0].code,
          serviceType: "standard",
          packageType: "box",
          insured: false,
          shippingCost: 0,
        },
  });

  const insured = watch("insured");
  const selectedCarrier = watch("carrierCode") || ALL_CARRIERS[0].code;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || !user) return;
    const files = Array.from(fileList);
    if (fileInputRef.current) fileInputRef.current.value = "";

    for (const file of files) {
      if (!isAcceptedMediaFile(file)) {
        toast.error(`${file.name} isn't an image or video file.`);
        continue;
      }
      if (isOversizedMediaFile(file)) {
        toast.error(`${file.name} is larger than ${MAX_MEDIA_FILE_MB}MB.`);
        continue;
      }
      setUploadingNames((prev) => [...prev, file.name]);
      try {
        const attachment = await uploadShipmentMedia(user.uid, shipmentId, file);
        setAttachments((prev) => [...prev, attachment]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      } finally {
        setUploadingNames((prev) => prev.filter((n) => n !== file.name));
      }
    }
  }

  async function handleRemoveAttachment(attachment: ShipmentAttachment) {
    setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    await deleteShipmentMedia(attachment);
  }

  async function onSubmit(values: ShipmentFormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      const packageInfo = {
        weightKg: values.weightKg,
        lengthCm: values.lengthCm,
        widthCm: values.widthCm,
        heightCm: values.heightCm,
        packageType: values.packageType,
        description: values.description,
      };
      if (isEdit && existing) {
        const updated = await updateShipment({
          ...existing,
          carrierCode: values.carrierCode,
          serviceType: values.serviceType,
          referenceNumber: values.referenceNumber || undefined,
          sender: values.sender,
          receiver: values.receiver,
          package: packageInfo,
          specialInstructions: values.specialInstructions,
          estimatedDeliveryDate: values.estimatedDeliveryDate,
          shippingCost: values.shippingCost,
          insured: values.insured,
          insuranceValue: values.insured ? values.insuranceValue : undefined,
          attachments,
        });
        toast.success("Shipment updated");
        router.push(`/dashboard/shipments/${updated.id}`);
        return;
      }
      const shipment = await createShipment(
        {
          id: shipmentId,
          userId: user.uid,
          carrierCode: values.carrierCode,
          serviceType: values.serviceType,
          referenceNumber: values.referenceNumber || undefined,
          sender: values.sender,
          receiver: values.receiver,
          package: packageInfo,
          specialInstructions: values.specialInstructions,
          estimatedDeliveryDate: values.estimatedDeliveryDate,
          shippingCost: values.shippingCost,
          insured: values.insured,
          insuranceValue: values.insured ? values.insuranceValue : undefined,
          attachments,
        },
        profile?.displayName ?? user.email
      );
      toast.success(`Shipment ${shipment.trackingNumber} created`);
      router.push(`/dashboard/shipments/${shipment.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save shipment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-accent-500 text-white shadow-lg shadow-brand-500/25">
          <PackagePlus size={20} />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit shipment" : "Create a shipment"}</h1>
          <p className="text-sm text-foreground/55">
            {isEdit ? `Editing ${existing?.trackingNumber}` : "A tracking number will be generated automatically."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Carrier &amp; service</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Carrier</Label>
              <div className="flex items-center gap-2">
                <CarrierLogo carrier={selectedCarrier} size={36} />
                <Select {...register("carrierCode")} className="flex-1">
                  {ALL_CARRIERS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <FieldError>{errors.carrierCode?.message}</FieldError>
            </div>
            <div>
              <Label>Service type</Label>
              <Select {...register("serviceType")}>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {SERVICE_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Reference number (optional)</Label>
              <Input {...register("referenceNumber")} placeholder="PO-10293" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sender information</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactFields prefix="sender" register={register} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receiver information</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactFields prefix="receiver" register={register} errors={errors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.01" {...register("weightKg")} placeholder="2.5" />
              <FieldError>{errors.weightKg?.message}</FieldError>
            </div>
            <div>
              <Label>Length (cm)</Label>
              <Input type="number" step="0.1" {...register("lengthCm")} placeholder="30" />
              <FieldError>{errors.lengthCm?.message}</FieldError>
            </div>
            <div>
              <Label>Width (cm)</Label>
              <Input type="number" step="0.1" {...register("widthCm")} placeholder="20" />
              <FieldError>{errors.widthCm?.message}</FieldError>
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input type="number" step="0.1" {...register("heightCm")} placeholder="15" />
              <FieldError>{errors.heightCm?.message}</FieldError>
            </div>
            <div>
              <Label>Package type</Label>
              <Select {...register("packageType")}>
                {PACKAGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-3">
              <Label>Package description (optional)</Label>
              <Input {...register("description")} placeholder="Electronics, documents, apparel…" />
            </div>
            <div className="sm:col-span-4">
              <Label>Special instructions (optional)</Label>
              <Textarea rows={3} {...register("specialInstructions")} placeholder="Leave at the front desk, signature required, etc." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Photos &amp; videos (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="w-full text-xs text-foreground/60"
              />
              <p className="mt-1 text-xs text-foreground/45">
                Photos or videos of the package/contents — up to {MAX_MEDIA_FILE_MB}MB each.
              </p>
            </div>

            {(attachments.length > 0 || uploadingNames.length > 0) && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {attachments.map((a) => (
                  <div key={a.id} className="group relative overflow-hidden rounded-lg border border-black/8 dark:border-white/10">
                    {a.kind === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element -- dynamic user-uploaded Storage URL
                      <img src={a.url} alt={a.name} className="h-24 w-full object-cover" />
                    ) : (
                      <video src={a.url} className="h-24 w-full object-cover" muted />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(a)}
                      aria-label={`Remove ${a.name}`}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    <div className="flex items-center gap-1 bg-black/50 px-1.5 py-1 text-[10px] text-white">
                      {a.kind === "video" ? <Film size={10} /> : <ImagePlus size={10} />}
                      <span className="truncate">{a.name}</span>
                      <span className="ml-auto shrink-0">{formatFileSize(a.sizeBytes)}</span>
                    </div>
                  </div>
                ))}
                {uploadingNames.map((name) => (
                  <div
                    key={name}
                    className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/15 text-foreground/45 dark:border-white/15"
                  >
                    <Loader2 size={16} className="animate-spin" />
                    <span className="max-w-[90%] truncate text-[10px]">{name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery &amp; cost</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Estimated delivery date</Label>
              <Input type="date" {...register("estimatedDeliveryDate")} />
              <FieldError>{errors.estimatedDeliveryDate?.message}</FieldError>
            </div>
            <div>
              <Label>Shipping cost (USD)</Label>
              <Input type="number" step="0.01" {...register("shippingCost")} placeholder="45.00" />
              <FieldError>{errors.shippingCost?.message}</FieldError>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" className="h-4 w-4 rounded" {...register("insured")} />
                Insure this shipment
              </label>
              {insured && (
                <Input type="number" step="0.01" {...register("insuranceValue")} placeholder="Insured value (USD)" />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Create shipment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
