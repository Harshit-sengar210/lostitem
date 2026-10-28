// backend/services/notificationsService.ts
// Firestore CRUD for user notification inbox

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Notification } from '@/data/mockItems';

const COLLECTION = 'notifications';

// ─── READ ────────────────────────────────────────────────────

/** Fetch all notifications for a user, newest first */
export async function getUserNotifications(uid: string): Promise<Notification[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

/** Fetch only unread notifications for a user */
export async function getUnreadNotifications(uid: string): Promise<Notification[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('uid', '==', uid),
      where('unread', '==', true),
      orderBy('createdAt', 'desc')
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

// ─── WRITE ───────────────────────────────────────────────────

/** Create a new notification for a user */
export async function createNotification(
  uid: string,
  data: Omit<Notification, 'id'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    uid,
    unread: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Mark a single notification as read */
export async function markNotificationRead(notifId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notifId), { unread: false });
}

/** Mark all of a user's notifications as read in one batch */
export async function markAllNotificationsRead(uid: string): Promise<void> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where('uid', '==', uid),
      where('unread', '==', true)
    )
  );

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { unread: false }));
  await batch.commit();
}

/** Delete all notifications for a user */
export async function clearAllNotifications(uid: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('uid', '==', uid))
  );

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Delete a single notification */
export async function deleteNotification(notifId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, notifId));
}
