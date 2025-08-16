import { NextRequest, NextResponse } from 'next/server';
import { pinataClient } from '@/lib/pinata';
import { prisma } from '@/lib/database';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/types';
import { verifyAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const walletAddress = await verifyAuthToken(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - only PNG allowed
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES).flat();
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PNG images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 400 }
      );
    }

    // Upload to Pinata
    const { cid, size } = await pinataClient.uploadFile(file);

    // Save to database
    const content = await prisma.content.create({
      data: {
        userWalletAddress: walletAddress,
        filename: file.name,
        fileType: file.type,
        fileSize: BigInt(size),
        ipfsCid: cid,
      },
    });

    return NextResponse.json({
      success: true,
      cid,
      content: {
        ...content,
        fileSize: content.fileSize.toString(),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}