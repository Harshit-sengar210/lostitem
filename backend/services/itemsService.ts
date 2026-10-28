// backend/services/itemsService.ts
// Firestore CRUD operations for lost/found item listings

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Item, ItemStatus, ItemCategory } from '@/data/mockItems';

const COLLECTION = 'items';

// ─── READ ───────────────────────────────────────────────────

/** Fetch all items */
export async function getAllItems(): Promise<Item[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

/** Fetch items by status (LOST | FOUND | CLAIMED …) */
export async function getItemsByStatus(status: ItemStatus): Promise<Item[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

/** Fetch items by category */
export async function getItemsByCategory(category: ItemCategory): Promise<Item[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

/** Fetch a single item by Firestore document ID */
export async function getItemById(id: string): Promise<Item | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Item;
}

/** Fetch N most recent items */
export async function getRecentItems(n = 10): Promise<Item[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(n))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item));
}

// ─── WRITE ──────────────────────────────────────────────────

/** Create a new lost/found listing */
export async function createItem(
  data: Omit<Item, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update any fields of an existing item */
export async function updateItem(
  id: string,
  data: Partial<Omit<Item, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Update only the status of an item */
export async function updateItemStatus(
  id: string,
  status: ItemStatus
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Permanently delete an item listing */
export async function deleteItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
