// src/app/api/upload/route.ts
// Next.js API Route — POST /api/upload
// Accepts a Base64 image, uploads it to Cloudinary, returns the secure URL.
// The Cloudinary API secret stays on the server and is never exposed.

import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/backend/services/cloudinaryService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, folder, publicId } = body as {
      image: string;      // Base64 data URL: "data:image/jpeg;base64,..."
      folder?: string;    // e.g. "foundback/items" or "foundback/avatars"
      publicId?: string;  // Optional custom public_id
    };

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const result = await uploadImageToCloudinary(
      image,
      folder ?? 'foundback/items',
      publicId
    );

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (err: any) {
    console.error('[Cloudinary Upload Error]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Upload failed' },
      { status: 500 }
    );
  }
}
