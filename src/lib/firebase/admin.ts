import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const REQUIRED_ADMIN_ENV_VARS = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const;

function missingAdminEnvVars(): string[] {
  return REQUIRED_ADMIN_ENV_VARS.filter((key) => !process.env[key]);
}

export const isFirebaseAdminConfigured = missingAdminEnvVars().length === 0;

let adminApp: App | null = null;

/**
 * Lazily initializes (once) and returns the Firebase Admin app for server-only code
 * (Route Handlers, Server Actions). Throws with the exact missing variable names
 * rather than failing silently.
 */
function resolvePrivateKey(): string {
  let key = process.env.FIREBASE_PRIVATE_KEY ?? "";
  // A common paste mistake in Vercel's env var UI: including the surrounding
  // quote characters as part of the value itself.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  // Env vars can't hold literal newlines — private keys are stored with `\n`
  // escape sequences and must be converted back before use.
  key = key.replace(/\\n/g, "\n");

  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY doesn't look like a valid PEM key (missing BEGIN/END markers) — " +
        "re-copy the exact \"private_key\" value from the service account JSON, keeping its \\n sequences intact."
    );
  }
  return key;
}

export function getFirebaseAdminApp(): App {
  if (adminApp) return adminApp;

  const missing = missingAdminEnvVars();
  if (missing.length > 0) {
    throw new Error(
      `Firebase Admin SDK is not configured. Missing environment variable(s): ${missing.join(", ")}`
    );
  }

  try {
    adminApp = getApps().length
      ? getApps()[0]!
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: resolvePrivateKey(),
          }),
        });
  } catch (err) {
    throw new Error(
      `Firebase Admin SDK failed to initialize: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

/** Verifies a client-supplied Firebase ID token, returning its decoded claims (including uid). */
export async function verifyIdToken(idToken: string) {
  return getAdminAuth().verifyIdToken(idToken);
}

/** Looks up whether a uid's Firestore profile has the admin role. */
export async function isAdminUser(uid: string): Promise<boolean> {
  const snap = await getAdminFirestore().collection("users").doc(uid).get();
  return snap.exists && snap.data()?.role === "admin";
}
