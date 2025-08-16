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

    // Get wallet linking information from database
    const walletLink = await prisma.$queryRaw`
      SELECT * FROM wallet_links 
      WHERE primary_wallet_address = ${primaryWalletAddress}
      LIMIT 1
    ` as Array<{ primary_wallet_address: string; zora_wallet_address?: string; linked_at?: Date }>;

    const linkData = walletLink[0] || null;

    return NextResponse.json({
      success: true,
      data: {
        primaryWallet: primaryWalletAddress,
        zoraWallet: linkData?.zora_wallet_address || null,
        linkedAt: linkData?.linked_at || null,
        isLinked: Boolean(linkData?.zora_wallet_address)
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