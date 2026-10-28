// backend/firebase.ts
// Firebase app initialization — imported by all backend services

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAVCvGdj-5C17Ey553TG4e66wU8z2oVneE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "found-back16.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "found-back16",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "found-back16.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "971596984405",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:971596984405:web:92d2ea15326558aaada4dc",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-KR7ET3SWSZ",
};

// Prevent duplicate initializations in hot-reload dev environments
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Core services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics only runs in the browser (not during SSR/build)
export const getAnalyticsInstance = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
