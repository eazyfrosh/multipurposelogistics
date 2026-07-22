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

        let decoded;
        try {
          decoded = await verifyIdToken(idToken);
        } catch (err) {
          // Distinguish "server isn't configured to verify tokens at all" (an
          // Admin SDK / env var problem) from "this token is genuinely bad"
          // (an expired/invalid session) — the client only ever sees a generic
          // @vercel/blob error either way, so this is what actually reaches
          // the server logs.
          console.error("[api/blob/upload] verifyIdToken failed:", err);
          throw new Error(
            err instanceof Error && err.message.startsWith("Firebase Admin SDK is not configured")
              ? err.message
              : "Invalid or expired session — please sign in again."
          );
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
    // @vercel/blob's client-side upload() discards this response body's `error`
    // field on any non-2xx status and throws its own generic "Failed to retrieve
    // the client token" instead — so this log line is the only place the real
    // reason is ever visible. Check the deployment's function logs, not the
    // browser, when this route fails.
    console.error("[api/blob/upload] Failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
