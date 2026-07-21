import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const REQUIRED_CLIENT_ENV_VARS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const missingClientEnvVars = REQUIRED_CLIENT_ENV_VARS.filter((key) => !process.env[key]);
const presentClientEnvVarCount = REQUIRED_CLIENT_ENV_VARS.length - missingClientEnvVars.length;

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
