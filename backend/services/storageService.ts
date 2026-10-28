// backend/services/storageService.ts
// Firebase Storage helpers for uploading item images

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload an item image to Firebase Storage and return the public download URL.
 * Path: items/{itemId}/{fileName}
 */
export async function uploadItemImage(
  itemId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}.${ext}`;
  const storageRef = ref(storage, `items/${itemId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

/**
 * Upload a user avatar image and return the public download URL.
 * Path: avatars/{uid}/{fileName}
 */
export async function uploadUserAvatar(
  uid: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `avatar.${ext}`;
  const storageRef = ref(storage, `avatars/${uid}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

/**
 * Delete an image from Firebase Storage by its full gs:// path.
 */
export async function deleteStorageFile(gsPath: string): Promise<void> {
  const storageRef = ref(storage, gsPath);
  await deleteObject(storageRef);
}
