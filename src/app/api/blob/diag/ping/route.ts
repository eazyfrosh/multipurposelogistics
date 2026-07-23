// TEMPORARY diagnostic route — delete once /api/blob/upload's crash is found.
// Zero third-party imports. If this crashes, the problem isn't firebase-admin
// or @vercel/blob at all — it's something platform/runtime-level.
export const runtime = "nodejs";

export async function POST() {
  console.log("[diag/ping] STARTED");
  return Response.json({ ok: true, route: "ping" });
}
