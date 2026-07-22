import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ["image/*", "video/*", "application/pdf"];
const MEDIA_PATH_PREFIX = "shipment-media/";

interface ClientPayload {
  idToken: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!clientPayload) {
          throw new Error("Missing authentication.");
        }
        const { idToken } = JSON.parse(clientPayload) as ClientPayload;
        const decoded = await verifyIdToken(idToken).catch(() => null);
        if (!decoded) {
          throw new Error("Invalid or expired session — please sign in again.");
        }

        // The requested path must be scoped under the verified user's own folder —
        // never trust a client-supplied uid in the path itself.
        if (!pathname.startsWith(`${MEDIA_PATH_PREFIX}${decoded.uid}/`)) {
          throw new Error("You can only upload media to your own shipments.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {
        // No server-side bookkeeping needed — the client writes the resulting
        // blob URL + metadata onto the shipment document in Firestore itself
        // once the upload() promise resolves.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
