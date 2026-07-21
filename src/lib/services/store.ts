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
  await setDoc(doc(requireDb(), collectionName, item.id), item as Record<string, unknown>, {
    merge: true,
  });
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
