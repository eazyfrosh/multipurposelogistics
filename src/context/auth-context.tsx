"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { getOne, upsert } from "@/lib/services/store";
import { logActivity } from "@/lib/services/activity";
import { defaultNotificationPrefs, type UserProfile } from "@/types";

const USERS_COLLECTION = "users";
const NOT_CONFIGURED_ERROR =
  "Firebase is not configured. Set the required NEXT_PUBLIC_FIREBASE_* environment variables — see .env.local.example.";

interface AuthContextValue {
  user: { uid: string; email: string; displayName: string; emailVerified: boolean } | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, company?: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  updateUserProfile: (partial: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function makeProfile(uid: string, email: string, displayName: string, company?: string): UserProfile {
  return {
    id: uid,
    uid,
    email,
    displayName: displayName || email.split("@")[0],
    role: "user",
    company,
    createdAt: new Date().toISOString(),
    notificationPrefs: defaultNotificationPrefs,
    apiKeys: [],
    plan: "starter",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrCreateProfile = useCallback(
    async (uid: string, email: string, displayName: string) => {
      const existing = await getOne<UserProfile>(USERS_COLLECTION, uid);
      if (existing) {
        setProfile(existing);
        return existing;
      }
      const created = makeProfile(uid, email, displayName);
      await upsert(USERS_COLLECTION, created);
      setProfile(created);
      return created;
    },
    []
  );

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? "",
          displayName: firebaseUser.displayName ?? "",
          emailVerified: firebaseUser.emailVerified,
        });
        await loadOrCreateProfile(firebaseUser.uid, firebaseUser.email ?? "", firebaseUser.displayName ?? "");
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadOrCreateProfile]);

  const signUp = useCallback(
    async (rawEmail: string, password: string, displayName: string, company?: string) => {
      const email = rawEmail.trim().toLowerCase();
      if (!auth) throw new Error(NOT_CONFIGURED_ERROR);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) await updateFirebaseProfile(cred.user, { displayName });
      await sendEmailVerification(cred.user);
      const created = makeProfile(cred.user.uid, email, displayName, company);
      await upsert(USERS_COLLECTION, created);
      setProfile(created);
      await logActivity(cred.user.uid, displayName, "user_created", "user", cred.user.uid, "Account created");
    },
    []
  );

  const logIn = useCallback(async (rawEmail: string, password: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!auth) throw new Error(NOT_CONFIGURED_ERROR);
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logOut = useCallback(async () => {
    if (auth) await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (rawEmail: string) => {
    const email = rawEmail.trim().toLowerCase();
    if (!auth) throw new Error(NOT_CONFIGURED_ERROR);
    await sendPasswordResetEmail(auth, email);
  }, []);

  const sendVerification = useCallback(async () => {
    if (auth?.currentUser) await sendEmailVerification(auth.currentUser);
  }, []);

  const persistProfile = useCallback(async (nextProfile: UserProfile) => {
    setProfile(nextProfile);
    await upsert(USERS_COLLECTION, nextProfile);
  }, []);

  const updateUserProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      if (!profile) return;
      await persistProfile({ ...profile, ...partial });
    },
    [profile, persistProfile]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signUp,
      logIn,
      logOut,
      resetPassword,
      sendVerification,
      updateUserProfile,
    }),
    [user, profile, loading, signUp, logIn, logOut, resetPassword, sendVerification, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
