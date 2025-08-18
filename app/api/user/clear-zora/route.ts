import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';
import { setCurrentUserWallet } from '@/lib/rls';

export async function DELETE(request: NextRequest) {
  try {
    const primaryWalletAddress = await verifyAuthToken(request);

    if (!primaryWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Set RLS context for the authenticated user
    await setCurrentUserWallet(prisma, primaryWalletAddress);

    // Clear Zora wallet linking from database using Prisma ORM
    // RLS policy ensures only user's own wallet links can be deleted
    await prisma.walletLink.deleteMany({
      where: { 
        primaryWalletAddress: primaryWalletAddress 
      }
    });

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