import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const primaryWalletAddress = await verifyAuthToken(request);

    if (!primaryWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch wallet linking information from database
    const walletLink = await prisma.$queryRaw<Array<{
      zora_wallet_address: string;
      linked_at: Date;
    }>>`
      SELECT zora_wallet_address, linked_at 
      FROM wallet_links 
      WHERE primary_wallet_address = ${primaryWalletAddress}
    `;

    if (walletLink.length === 0) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        primaryWallet: primaryWalletAddress,
        zoraWallet: walletLink[0].zora_wallet_address,
        linkedAt: walletLink[0].linked_at
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