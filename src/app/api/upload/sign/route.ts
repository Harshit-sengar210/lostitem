// src/app/api/upload/sign/route.ts
// Next.js API Route — GET /api/upload/sign
// Returns a signed upload params object so the client can upload
// DIRECTLY to Cloudinary (no file passes through our server).

import { NextRequest, NextResponse } from 'next/server';
import { generateSignedUploadParams } from '@/backend/services/cloudinaryService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get('folder') ?? 'foundback/items';

    const params = generateSignedUploadParams(folder);

    return NextResponse.json({ success: true, ...params });
  } catch (err: any) {
    console.error('[Cloudinary Sign Error]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Could not generate signature' },
      { status: 500 }
    );
  }
}
