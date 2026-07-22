"use client";

import { upload } from "@vercel/blob/client";
import { auth } from "@/lib/firebase/client";
import { generateId } from "@/lib/utils";
import type { ShipmentAttachment } from "@/types";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPE_PATTERN = /^(image|video)\/|^application\/pdf$/;

export function isAcceptedMediaFile(file: File): boolean {
  return ACCEPTED_TYPE_PATTERN.test(file.type);
}

export function isOversizedMediaFile(file: File): boolean {
  return file.size > MAX_FILE_BYTES;
}

export const MAX_MEDIA_FILE_MB = MAX_FILE_BYTES / (1024 * 1024);

function kindFromContentType(contentType: string): ShipmentAttachment["kind"] {
  if (contentType.startsWith("video/")) return "video";
  if (contentType === "application/pdf") return "pdf";
  return "image";
}

async function requireIdToken(): Promise<string> {
  const token = await auth?.currentUser?.getIdToken();
  if (!token) {
    throw new Error("You must be signed in to upload media.");
  }
  return token;
}

export async function uploadShipmentMedia(
  userId: string,
  shipmentId: string,
  file: File,
  onProgress?: (percentage: number) => void
): Promise<ShipmentAttachment> {
  if (!isAcceptedMediaFile(file)) {
    throw new Error(`${file.name} isn't an image, video, or PDF file.`);
  }
  if (isOversizedMediaFile(file)) {
    throw new Error(`${file.name} is larger than ${MAX_MEDIA_FILE_MB}MB.`);
  }

  const idToken = await requireIdToken();
  const id = generateId("med_");
  const pathname = `shipment-media/${userId}/${shipmentId}/${id}-${file.name}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    clientPayload: JSON.stringify({ idToken }),
    contentType: file.type,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(percentage) : undefined,
  });

  return {
    id,
    name: file.name,
    url: blob.url,
    contentType: file.type,
    kind: kindFromContentType(file.type),
    sizeBytes: file.size,
  };
}

export async function deleteShipmentMedia(attachment: ShipmentAttachment): Promise<void> {
  const idToken = await requireIdToken().catch(() => null);
  if (!idToken) return;

  await fetch("/api/blob/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ url: attachment.url }),
  }).catch(() => {});
}
