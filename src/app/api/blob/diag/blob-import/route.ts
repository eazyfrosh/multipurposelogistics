// TEMPORARY diagnostic route — delete once /api/blob/upload's crash is found.
// Imports @vercel/blob/client and nothing else, does not call any of it.
// If this crashes but diag/ping doesn't, the crash is at @vercel/blob/client's
// module-evaluation time (it imports `undici` and `crypto` at its top level).
export const runtime = "nodejs";

import { handleUpload } from "@vercel/blob/client";

export async function POST() {
  console.log("[diag/blob-import] STARTED, handleUpload typeof:", typeof handleUpload);
  return Response.json({ ok: true, route: "blob-import" });
}
