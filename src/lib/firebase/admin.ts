import "server-only";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminApp } from "@/lib/firebase/admin-auth";

export {
  isFirebaseAdminConfigured,
  getFirebaseAdminApp,
  getAdminAuth,
  verifyIdToken,
} from "@/lib/firebase/admin-auth";

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

/** Looks up whether a uid's Firestore profile has the admin role. */
export async function isAdminUser(uid: string): Promise<boolean> {
  const snap = await getAdminFirestore().collection("users").doc(uid).get();
  return snap.exists && snap.data()?.role === "admin";
}
