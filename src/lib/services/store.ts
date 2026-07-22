"use client";

import { db } from "@/lib/firebase/client";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

function requireDb() {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Set the required NEXT_PUBLIC_FIREBASE_* environment variables — see .env.local.example."
    );
  }
  return db;
}

// Firestore rejects literal `undefined` field values outright (unlike the old localStorage
// path, which silently dropped them via JSON.stringify). Optional fields throughout the app
// (referenceNumber, specialInstructions, insuranceValue, etc.) are commonly left `undefined`
// rather than omitted, so every write is sanitized here rather than at each call site.
// Omitting the key (vs. writing `null`) is also the correct `merge: true` semantics — it
// leaves any existing value untouched instead of clobbering it.
function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function getAll<T extends { id: string }>(collectionName: string): Promise<T[]> {
  const snap = await getDocs(collection(requireDb(), collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function getOne<T extends { id: string }>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const snap = await getDoc(doc(requireDb(), collectionName, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

export async function upsert<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  await setDoc(
    doc(requireDb(), collectionName, item.id),
    stripUndefined(item as Record<string, unknown>),
    { merge: true }
  );
}

export async function remove(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(requireDb(), collectionName, id));
}

export async function queryByField<T extends { id: string }>(
  collectionName: string,
  field: string,
  value: string
): Promise<T[]> {
  const q = query(collection(requireDb(), collectionName), where(field, "==", value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}
