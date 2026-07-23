import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminUser, verifyIdToken } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const MEDIA_PATH_PREFIX = "shipment-media/";
const LOG_PREFIX = "[api/blob/delete]";

export async function POST(request: Request): Promise<NextResponse> {
  console.log(`${LOG_PREFIX} route entered`);

  // Everything is inside this try/catch so nothing can escape uncaught and
  // crash the function (see api/blob/upload/route.ts for why that matters).
  try {
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      console.error(`${LOG_PREFIX} missing Authorization header`);
      return NextResponse.json({ error: "Missing authentication." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await verifyIdToken(idToken);
    } catch (err) {
      console.error(`${LOG_PREFIX} verifyIdToken failed:`, err);
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }
    console.log(`${LOG_PREFIX} token verified for uid:`, decoded.uid);

    const { url } = (await request.json().catch(() => ({}))) as { url?: string };
    if (!url) {
      return NextResponse.json({ error: "Missing url." }, { status: 400 });
    }

    const pathname = new URL(url).pathname.replace(/^\/+/, "");
    const isOwnMedia = pathname.startsWith(`${MEDIA_PATH_PREFIX}${decoded.uid}/`);
    if (!isOwnMedia && !(await isAdminUser(decoded.uid))) {
      console.error(`${LOG_PREFIX} uid not authorized to delete this path:`, { pathname, uid: decoded.uid });
      return NextResponse.json({ error: "You can only delete your own media." }, { status: 403 });
    }

    await del(url);
    console.log(`${LOG_PREFIX} deleted:`, pathname);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`${LOG_PREFIX} request failed:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 });
  }
}
