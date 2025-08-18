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
    const walletLink = await prisma.walletLink.findUnique({
      where: { 
        primaryWalletAddress: primaryWalletAddress 
      },
      select: {
        zoraWalletAddress: true,
        linkedAt: true
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
        zoraWallet: walletLink.zoraWalletAddress,
        linkedAt: walletLink.linkedAt
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