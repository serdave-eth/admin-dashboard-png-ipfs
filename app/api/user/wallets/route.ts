import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';
import { setCurrentUserWallet } from '@/lib/rls';

export async function GET(request: NextRequest) {
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

    // Get wallet linking information from database using Prisma ORM
    // RLS policy ensures only user's own wallet links are returned
    const walletLink = await prisma.wallet_links.findUnique({
      where: { 
        user_wallet_address: primaryWalletAddress 
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        primaryWallet: primaryWalletAddress,
        zoraWallet: walletLink?.zora_wallet_address || null,
        linkedAt: walletLink?.linked_at || null,
        isLinked: Boolean(walletLink?.zora_wallet_address)
      }
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet information' },
      { status: 500 }
    );
  }
}