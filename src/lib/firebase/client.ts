import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next.js only inlines *static* `process.env.NEXT_PUBLIC_*` member expressions into the
// client bundle — a dynamic `process.env[key]` loop would silently read `undefined` for
// every key in the browser (while still working during SSR), causing a server/client
// mismatch. Each check below must stay a literal, statically-inlinable expression.
const missingClientEnvVars: string[] = [];
if (!firebaseConfig.apiKey) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
if (!firebaseConfig.messagingSenderId) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

export const isFirebaseConfigured = missingClientEnvVars.length === 0;

// Firebase is required — there is no local/demo fallback. Warn as soon as any var is set
// so a partial configuration is caught early, since auth/Firestore calls will otherwise
// throw a less specific "Firebase is not configured" error at first use.
if (typeof window !== "undefined" && missingClientEnvVars.length > 0) {
  console.warn(
    `[firebase] Incomplete Firebase configuration. Missing environment variable(s): ${missingClientEnvVars.join(", ")}. ` +
      "Authentication and Firestore calls will fail until all required NEXT_PUBLIC_FIREBASE_* variables are set."
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured && typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
