import { NextRequest, NextResponse } from 'next/server';
import { decryptBuffer, getEncryptionKey } from '@/lib/encryption';
import { pinataClient } from '@/lib/pinata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params;
    
    if (!cid) {
      return NextResponse.json(
        { error: 'CID is required' },
        { status: 400 }
      );
    }

    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      return NextResponse.json(
        { error: 'Encryption key not configured' },
        { status: 500 }
      );
    }

    // Fetch the encrypted file from IPFS using authenticated Pinata client
    const arrayBuffer = await pinataClient.fetchFile(cid);
    
    // Get the encrypted buffer
    const encryptedBuffer = Buffer.from(arrayBuffer);
    
    // Check if this looks like encrypted data (should start with IV)
    if (encryptedBuffer.length < 16) {
      // Return the original buffer as-is (for backward compatibility)
      return new NextResponse(new Uint8Array(encryptedBuffer), {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
    
    // Decrypt the buffer
    let finalBuffer;
    try {
      const decryptedBuffer = decryptBuffer(encryptedBuffer, encryptionKey);
      finalBuffer = decryptedBuffer;
    } catch {
      // Fallback to original buffer for backward compatibility
      finalBuffer = encryptedBuffer;
    }
    
    // Return the image
    return new NextResponse(new Uint8Array(finalBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Decryption error:', error);
    return NextResponse.json(
      { error: `Failed to decrypt file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}