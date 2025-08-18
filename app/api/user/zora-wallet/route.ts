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

    // Fetch wallet linking information from database using Prisma ORM
    // RLS policy ensures only user's own wallet links are returned
    const walletLink = await prisma.wallet_links.findUnique({
      where: { 
        user_wallet_address: primaryWalletAddress 
      },
      select: {
        zora_wallet_address: true,
        linked_at: true
      }
    });

    if (!walletLink) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        primaryWallet: primaryWalletAddress,
        zoraWallet: walletLink.zora_wallet_address,
        linkedAt: walletLink.linked_at
      }
    });
  } catch (error) {
    console.error('Fetch Zora wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Zora wallet information' },
      { status: 500 }
    );
  }
}