import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdminUser, verifyIdToken } from "@/lib/firebase/admin";

const MEDIA_PATH_PREFIX = "shipment-media/";

export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Missing authentication." }, { status: 401 });
  }

  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    console.error("[api/blob/delete] verifyIdToken failed:", err);
    return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
  }

  const { url } = (await request.json().catch(() => ({}))) as { url?: string };
  if (!url) {
    return NextResponse.json({ error: "Missing url." }, { status: 400 });
  }

  const pathname = new URL(url).pathname.replace(/^\/+/, "");
  const isOwnMedia = pathname.startsWith(`${MEDIA_PATH_PREFIX}${decoded.uid}/`);
  if (!isOwnMedia && !(await isAdminUser(decoded.uid))) {
    return NextResponse.json({ error: "You can only delete your own media." }, { status: 403 });
  }

  try {
    await del(url);
  } catch (err) {
    console.error("[api/blob/delete] del() failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
