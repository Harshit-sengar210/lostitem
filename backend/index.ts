// backend/index.ts
// Central export for all backend services — import from here in your pages/components

// Firebase app instance
export { default as firebaseApp, db, auth, storage } from './firebase';

// Firestore services
export * from './services/itemsService';
export * from './services/usersService';
export * from './services/notificationsService';
export * from './services/storageService';

// Cloudinary (server-side only — use inside API routes)
export * from './services/cloudinaryService';
