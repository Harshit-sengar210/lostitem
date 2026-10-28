// backend/services/usersService.ts
// Firestore user profile CRUD + Firebase Authentication helpers

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const COLLECTION = 'users';

// ─── AUTH ────────────────────────────────────────────────────

/** Register a new user with email/password and create a Firestore profile */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<FirebaseUser> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // Set display name on Firebase Auth profile
  await updateProfile(user, { displayName: name });

  // Create Firestore profile document
  await setDoc(doc(db, COLLECTION, user.uid), {
    uid: user.uid,
    name,
    email,
    phone: '',
    trustScore: 80,
    itemsLost: 0,
    itemsFound: 0,
    itemsRecovered: 0,
    itemsReturned: 0,
    targetRole: 'both',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

/** Sign in an existing user */
export async function loginUser(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

/** Sign out the current user */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/** Subscribe to auth state changes (returns unsubscribe function) */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── FIRESTORE PROFILE ───────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  trustScore: number;
  itemsLost: number;
  itemsFound: number;
  itemsRecovered: number;
  itemsReturned: number;
  targetRole: 'lost' | 'found' | 'both';
}

/** Fetch a user's Firestore profile by UID */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

/** Update fields in a user's Firestore profile */
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Increment a user's stat counter (e.g. itemsLost, itemsRecovered) */
export async function incrementUserStat(
  uid: string,
  field: 'itemsLost' | 'itemsFound' | 'itemsRecovered' | 'itemsReturned',
  amount = 1
): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return;
  const current = (snap.data()[field] as number) || 0;
  await updateDoc(doc(db, COLLECTION, uid), {
    [field]: current + amount,
    updatedAt: serverTimestamp(),
  });
}
