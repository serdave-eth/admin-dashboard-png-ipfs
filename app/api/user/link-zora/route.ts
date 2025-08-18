import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';
import { setCurrentUserWallet } from '@/lib/rls';

export async function POST(request: NextRequest) {
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

    // Extract Zora wallet address from user's linked accounts
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7).trim();
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 400 }
      );
    }

    // For development mode, we'll extract from the token payload
    let zoraWalletAddress: string | null = null;

    try {
      // Decode JWT payload (dev mode only)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        console.log('Token payload for debugging:', JSON.stringify(payload, null, 2));
        
        // Look for cross-app account in linked accounts
        const linkedAccounts = payload.linkedAccounts || [];
        console.log('Linked accounts found:', linkedAccounts);
        
        // Try different ways to find the Zora account
        const zoraAccount = linkedAccounts.find((account: Record<string, unknown>) => 
          account.type === 'cross_app' || 
          (typeof account.subject === 'string' && account.subject?.includes('zora')) ||
          account.appId === (process.env.NEXT_PUBLIC_ZORA_APP_ID || 'clpgf04wn04hnkw0fv1m11mnb')
        );
        
        console.log('Found Zora account:', zoraAccount);
        
        if (zoraAccount) {
          // Try different properties for the wallet address
          zoraWalletAddress = zoraAccount.address || 
                             zoraAccount.walletAddress || 
                             zoraAccount.subject ||
                             zoraAccount.linkedAccountId ||
                             null;
        }
      }
    } catch (e) {
      console.error('Failed to extract Zora wallet:', e);
    }

    // If we still don't have a Zora wallet address from the token, 
    // use the primary wallet address since for external wallets they should be the same
    if (!zoraWalletAddress) {
      console.log('No Zora wallet found in token, using primary wallet address for external wallet');
      zoraWalletAddress = primaryWalletAddress; // For external wallets, they should be the same
    }

    // Upsert wallet linking information using Prisma ORM
    await prisma.wallet_links.upsert({
      where: { 
        user_wallet_address: primaryWalletAddress 
      },
      create: { 
        user_wallet_address: primaryWalletAddress,
        zora_wallet_address: zoraWalletAddress,
        linked_at: new Date()
      },
      update: { 
        zora_wallet_address: zoraWalletAddress,
        linked_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        primaryWallet: primaryWalletAddress,
        zoraWallet: zoraWalletAddress,
        linkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Link Zora error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to link Zora account' },
      { status: 500 }
    );
  }
}