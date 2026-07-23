import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin-auth";

// Explicit rather than relying on the implicit default — this route needs the
// Node.js runtime (firebase-admin uses Node-only APIs and is not Edge-compatible).
export const runtime = "nodejs";

const MAX_FILE_BYTES = 50 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ["image/*", "video/*", "application/pdf"];
const MEDIA_PATH_PREFIX = "shipment-media/";
const LOG_PREFIX = "[api/blob/upload]";

interface ClientPayload {
  idToken: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  console.log(`${LOG_PREFIX} route entered`);

  // Everything — including parsing the request body — is inside this try/catch.
  // A throw anywhere in this handler must never escape uncaught: an uncaught
  // exception here is a hard function crash (500 FUNCTION_INVOCATION_FAILED)
  // rather than a normal error response, which is far harder to diagnose.
  try {
    console.log(`${LOG_PREFIX} parsing request body`);
    const body = (await request.json()) as HandleUploadBody;
    console.log(`${LOG_PREFIX} request body parsed, event type:`, body.type);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        console.log(`${LOG_PREFIX} onBeforeGenerateToken entered for pathname:`, pathname);

        if (!clientPayload) {
          console.error(`${LOG_PREFIX} missing clientPayload`);
          throw new Error("Missing authentication.");
        }

        let idToken: string;
        try {
          idToken = (JSON.parse(clientPayload) as ClientPayload).idToken;
        } catch (err) {
          console.error(`${LOG_PREFIX} clientPayload is not valid JSON:`, err);
          throw new Error("Malformed authentication payload.");
        }
        console.log(`${LOG_PREFIX} clientPayload parsed, verifying Firebase ID token`);

        let decoded;
        try {
          decoded = await verifyIdToken(idToken);
        } catch (err) {
          // Distinguish "server isn't configured to verify tokens at all" (an
          // Admin SDK / env var problem) from "this token is genuinely bad"
          // (an expired/invalid session) — the client only ever sees a generic
          // @vercel/blob error either way, so this log line is what actually
          // reaches the deployment's function logs.
          console.error(`${LOG_PREFIX} verifyIdToken failed:`, err);
          throw new Error(
            err instanceof Error && err.message.startsWith("Firebase Admin SDK is not configured")
              ? err.message
              : err instanceof Error && err.message.startsWith("Firebase Admin SDK failed to initialize")
                ? err.message
                : "Invalid or expired session — please sign in again."
          );
        }
        console.log(`${LOG_PREFIX} token verified for uid:`, decoded.uid);

        // The requested path must be scoped under the verified user's own folder —
        // never trust a client-supplied uid in the path itself.
        if (!pathname.startsWith(`${MEDIA_PATH_PREFIX}${decoded.uid}/`)) {
          console.error(`${LOG_PREFIX} pathname not scoped to uid:`, { pathname, uid: decoded.uid });
          throw new Error("You can only upload media to your own shipments.");
        }

        console.log(`${LOG_PREFIX} authorized, issuing Blob client token`);
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: false,
        };
      },
      // No onUploadCompleted: we don't need Vercel Blob to call back after the
      // upload finishes — the client writes the resulting blob URL + metadata
      // onto the shipment document in Firestore itself once upload() resolves.
      // Omitting it also means no callbackUrl is registered on the token, so
      // Blob's infrastructure never issues that second webhook request at all.
    });

    console.log(`${LOG_PREFIX} handleUpload resolved successfully, type:`, jsonResponse.type);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    // @vercel/blob's client-side upload() discards this response body's `error`
    // field on any non-2xx status and throws its own generic "Failed to retrieve
    // the client token" instead — so this log line is the only place the real
    // reason is ever visible. Check the deployment's function logs, not the
    // browser, when this route fails.
    console.error(`${LOG_PREFIX} request failed:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
