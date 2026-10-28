// backend/services/cloudinaryService.ts
// Server-side Cloudinary SDK — runs ONLY in API routes (never in the browser)
// API Secret is kept secure and never exposed to the client.

import { v2 as cloudinary } from 'cloudinary';

// Configure once on import
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // server-only
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a Base64-encoded image string to Cloudinary.
 * Used inside Next.js API routes — never call from client components.
 *
 * @param base64Data  - "data:image/jpeg;base64,/9j/..."
 * @param folder      - Cloudinary folder path e.g. "foundback/items"
 * @param publicId    - Optional custom public_id
 */
export async function uploadImageToCloudinary(
  base64Data: string,
  folder = 'foundback/items',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 1200, crop: 'limit' }, // cap at 1200px wide
      { quality: 'auto', fetch_format: 'auto' }, // auto compress & convert
    ],
  });

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Generate a signed upload URL so the client can upload directly
 * to Cloudinary without going through our server.
 */
export function generateSignedUploadParams(folder = 'foundback/items') {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    folder,
  };
}

export { cloudinary };
