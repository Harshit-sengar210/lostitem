// src/hooks/useCloudinaryUpload.ts
// Client-side hook for uploading images via /api/upload
// Usage:
//   const { upload, uploading, error } = useCloudinaryUpload();
//   const url = await upload(file, 'foundback/items');

import { useState, useCallback } from 'react';

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, folder = 'foundback/items'): Promise<string | null> => {
      setUploading(true);
      setError(null);

      try {
        // Convert File → Base64 data URL
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, folder }),
        });

        const data: UploadResult & { error?: string } = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error ?? 'Upload failed');
        }

        return data.url;
      } catch (err: any) {
        setError(err?.message ?? 'Upload failed');
        return null;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  return { upload, uploading, error };
}
