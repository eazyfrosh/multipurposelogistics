import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/firebase/admin-auth";

// Explicit rather than relying on the implicit default — this route needs the
// Node.js runtime (firebase-admin uses Node-only APIs and is not Edge-compatible).
export const runtime = "nodejs";

// The browser's direct upload to vercel.com/api/blob (the client-token flow in
// /api/blob/upload) hits a cross-origin CORS block on this deployment that's
// still being tracked down on the Vercel account/store side. Routing the bytes
// through our own same-origin route instead sidesteps CORS entirely — the
// browser talks only to our domain, and our server's call to Vercel Blob is a
// server-to-server request, which is never subject to CORS in the first place.
// Trade-off: this route's body passes through a Vercel Function, which caps
// request bodies well below the 50MB the direct-upload flow allowed, hence the
// lower MAX_FILE_BYTES below.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPE_PATTERN = /^(image|video)\/|^application\/pdf$/;
const MEDIA_PATH_PREFIX = "shipment-media/";
const LOG_PREFIX = "[api/blob/upload-proxy]";

export async function POST(request: Request): Promise<NextResponse> {
  console.log(`${LOG_PREFIX} route entered`);

  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Missing authentication." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await verifyIdToken(idToken);
    } catch (err) {
      console.error(`${LOG_PREFIX} verifyIdToken failed:`, err);
      return NextResponse.json({ error: "Invalid or expired session — please sign in again." }, { status: 401 });
    }
    console.log(`${LOG_PREFIX} token verified for uid:`, decoded.uid);

    const formData = await request.formData();
    const file = formData.get("file");
    const pathnameSuffix = formData.get("pathnameSuffix");
    if (!(file instanceof File) || typeof pathnameSuffix !== "string" || !pathnameSuffix) {
      return NextResponse.json({ error: "Missing file or pathnameSuffix." }, { status: 400 });
    }

    if (!ACCEPTED_TYPE_PATTERN.test(file.type)) {
      return NextResponse.json({ error: `${file.name} isn't an image, video, or PDF file.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `${file.name} is larger than ${MAX_FILE_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Scoped under the verified user's own folder — never trust a client-supplied uid.
    const pathname = `${MEDIA_PATH_PREFIX}${decoded.uid}/${pathnameSuffix}`;

    console.log(`${LOG_PREFIX} uploading ${file.name} (${file.size} bytes) to`, pathname);
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    console.log(`${LOG_PREFIX} put() resolved, url:`, blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error(`${LOG_PREFIX} request failed:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 400 });
  }
}
