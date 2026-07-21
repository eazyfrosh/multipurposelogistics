import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
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
if (!firebaseConfig.storageBucket) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfig.messagingSenderId) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) missingClientEnvVars.push("NEXT_PUBLIC_FIREBASE_APP_ID");

const presentClientEnvVarCount = 6 - missingClientEnvVars.length;

export const isFirebaseConfigured = missingClientEnvVars.length === 0;

// Only warn when configuration looks *attempted but incomplete* — zero vars set is the
// supported local-demo mode (see AuthProvider's isDemoMode) and shouldn't be flagged.
if (typeof window !== "undefined" && presentClientEnvVarCount > 0 && missingClientEnvVars.length > 0) {
  console.warn(
    `[firebase] Incomplete Firebase configuration. Missing environment variable(s): ${missingClientEnvVars.join(", ")}. ` +
      "Falling back to local demo mode until all required NEXT_PUBLIC_FIREBASE_* variables are set."
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured && typeof window !== "undefined") {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
