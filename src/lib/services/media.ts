"use client";

import { auth } from "@/lib/firebase/client";
import { generateId } from "@/lib/utils";
import type { ShipmentAttachment } from "@/types";

// Must match the cap enforced server-side in /api/blob/upload-proxy/route.ts —
// that route's body passes through a Vercel Function, which caps it well below
// what the old direct-to-Blob browser upload allowed.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
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
  const pathnameSuffix = `${shipmentId}/${id}-${file.name}`;

  const url = await uploadViaProxy(file, pathnameSuffix, idToken, onProgress);

  return {
    id,
    name: file.name,
    url,
    contentType: file.type,
    kind: kindFromContentType(file.type),
    sizeBytes: file.size,
  };
}

// Uploads through our own same-origin /api/blob/upload-proxy route instead of
// @vercel/blob/client's upload(), which PUTs directly from the browser to
// vercel.com — a cross-origin request that's hitting a CORS block on this
// deployment. Proxying through our own route means the browser never talks to
// vercel.com directly (no CORS possible), and our server's own call to Vercel
// Blob is server-to-server (CORS doesn't apply there at all). Uses XHR rather
// than fetch specifically to get upload progress events for the progress bar.
function uploadViaProxy(
  file: File,
  pathnameSuffix: string,
  idToken: string,
  onProgress?: (percentage: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathnameSuffix", pathnameSuffix);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/blob/upload-proxy");
    xhr.setRequestHeader("Authorization", `Bearer ${idToken}`);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.onload = () => {
      let body: { url?: string; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // ignore, handled by the status check below
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.url) {
        onProgress?.(100);
        resolve(body.url);
      } else {
        reject(new Error(body.error || `Failed to upload ${file.name}`));
      }
    };
    xhr.onerror = () => reject(new Error(`Failed to upload ${file.name} — network error.`));
    xhr.onabort = () => reject(new Error(`Upload of ${file.name} was cancelled.`));

    xhr.send(formData);
  });
}

export async function deleteShipmentMedia(attachment: ShipmentAttachment): Promise<void> {
  const idToken = await requireIdToken().catch(() => null);
  if (!idToken) return;

  try {
    const res = await fetch("/api/blob/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ url: attachment.url }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[deleteShipmentMedia] /api/blob/delete failed:", res.status, body);
    }
  } catch (err) {
    console.error("[deleteShipmentMedia] request failed:", err);
  }
}
