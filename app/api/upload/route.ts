import { NextRequest, NextResponse } from 'next/server';
import { pinataClient } from '@/lib/pinata';
import { prisma } from '@/lib/database';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/types';
import { verifyAuthToken } from '@/lib/auth';
import { encryptBuffer, getEncryptionKey } from '@/lib/encryption';
import { setCurrentUserWallet } from '@/lib/rls';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const walletAddress = await verifyAuthToken(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Set RLS context for the authenticated user
    await setCurrentUserWallet(prisma, walletAddress);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const coinContractAddress = formData.get('coinContractAddress') as string;
    const minimumTokenAmount = formData.get('minimumTokenAmount') as string;

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

    // Encrypt the file before uploading to IPFS
    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      return NextResponse.json(
        { success: false, error: 'Encryption key not configured' },
        { status: 500 }
      );
    }

    // Convert file to buffer and encrypt
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const encryptedBuffer = encryptBuffer(fileBuffer, encryptionKey);
    
    // Create a new File object with the encrypted data
    const encryptedFile = new File([new Uint8Array(encryptedBuffer)], file.name, { type: file.type });

    // Upload encrypted file to Pinata
    const { cid, size } = await pinataClient.uploadFile(encryptedFile);

    // Save to database
    const content = await prisma.content.create({
      data: {
        id: randomUUID(),
        user_wallet_address: walletAddress,
        filename: file.name,
        file_type: file.type,
        file_size: BigInt(size),
        ipfs_cid: cid,
        coin_contract_address: coinContractAddress || null,
        minimum_token_amount: minimumTokenAmount || null,
      },
    });

    console.log('Upload successful:', {
      fileCid: cid,
      coinContractAddress: coinContractAddress || 'None',
      minimumTokenAmount: minimumTokenAmount || 'None'
    });

    return NextResponse.json({
      success: true,
      cid,
      content: {
        ...content,
        fileSize: content.file_size.toString(),
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