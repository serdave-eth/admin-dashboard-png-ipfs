import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const primaryWalletAddress = await verifyAuthToken(request);

    if (!primaryWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clear Zora wallet linking from database
    await prisma.$executeRaw`
      DELETE FROM wallet_links 
      WHERE primary_wallet_address = ${primaryWalletAddress}
    `;

    return NextResponse.json({
      success: true,
      message: 'Zora linking cleared successfully'
    });
  } catch (error) {
    console.error('Clear Zora linking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear Zora linking' },
      { status: 500 }
    );
  }
}