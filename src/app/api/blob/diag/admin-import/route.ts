// TEMPORARY diagnostic route — delete once /api/blob/upload's crash is found.
// Imports firebase-admin/auth (via admin-auth.ts) and nothing else. Does not
// call getFirebaseAdminApp() — this only tests whether the *import itself*
// (module evaluation) crashes, independent of whether env vars are configured.
// If this crashes but diag/ping doesn't, the crash is at firebase-admin's
// module-evaluation time.
export const runtime = "nodejs";

import { isFirebaseAdminConfigured } from "@/lib/firebase/admin-auth";

export async function POST() {
  console.log("[diag/admin-import] STARTED, isFirebaseAdminConfigured:", isFirebaseAdminConfigured);
  return Response.json({ ok: true, route: "admin-import", isFirebaseAdminConfigured });
}
