"use client";

import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/client";
import { generateId } from "@/lib/utils";
import type { ShipmentAttachment } from "@/types";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPE_PATTERN = /^(image|video)\//;

export function isAcceptedMediaFile(file: File): boolean {
  return ACCEPTED_TYPE_PATTERN.test(file.type);
}

export function isOversizedMediaFile(file: File): boolean {
  return file.size > MAX_FILE_BYTES;
}

export const MAX_MEDIA_FILE_MB = MAX_FILE_BYTES / (1024 * 1024);

export async function uploadShipmentMedia(
  userId: string,
  shipmentId: string,
  file: File
): Promise<ShipmentAttachment> {
  if (!storage) {
    throw new Error(
      "Firebase is not configured. Set the required NEXT_PUBLIC_FIREBASE_* environment variables — see .env.local.example."
    );
  }
  if (!isAcceptedMediaFile(file)) {
    throw new Error(`${file.name} isn't an image or video file.`);
  }
  if (isOversizedMediaFile(file)) {
    throw new Error(`${file.name} is larger than ${MAX_MEDIA_FILE_MB}MB.`);
  }

  const id = generateId("med_");
  const path = `shipment-media/${userId}/${shipmentId}/${id}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  const url = await getDownloadURL(fileRef);

  return {
    id,
    name: file.name,
    url,
    contentType: file.type,
    kind: file.type.startsWith("video/") ? "video" : "image",
    sizeBytes: file.size,
  };
}

export async function deleteShipmentMedia(attachment: ShipmentAttachment): Promise<void> {
  if (!storage) return;
  // A download URL is enough to resolve the underlying storage ref — no need
  // to separately track the raw path.
  await deleteObject(ref(storage, attachment.url)).catch(() => {});
}
