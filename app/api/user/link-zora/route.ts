import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { PrivyClient } from '@privy-io/server-auth';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Verify token without requiring wallet address
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const privyAppSecret = process.env.PRIVY_APP_SECRET?.trim();
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
    
    if (!privyAppId) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    let userId: string;
    
    // Verify token and get user ID
    if (privyAppSecret) {
      try {
        const privyClient = new PrivyClient(privyAppId, privyAppSecret);
        const claims = await privyClient.verifyAuthToken(token);
        
        if (!claims || !claims.userId) {
          return NextResponse.json(
            { success: false, error: 'Invalid token' },
            { status: 401 }
          );
        }
        userId = claims.userId;
      } catch (error) {
        console.error('Token verification failed:', error);
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
    } else {
      // Dev mode - extract user ID from token
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (!payload.sub) {
          return NextResponse.json(
            { success: false, error: 'Invalid token structure' },
            { status: 401 }
          );
        }
        userId = payload.sub;
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid token format' },
          { status: 401 }
        );
      }
    }

    // Get primary wallet address from headers if available
    const primaryWalletAddress = request.headers.get('x-privy-authenticated-wallet-address');
    
    if (primaryWalletAddress) {
      // Set RLS context for the authenticated user  
      await prisma.$executeRaw`SELECT set_config('app.current_user_wallet', ${primaryWalletAddress}, true)`;
    }

    // Extract Zora wallet address from user's linked accounts
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

    // Only create wallet links if we have a primary wallet address
    if (primaryWalletAddress) {
      // Upsert wallet linking information using Prisma ORM
      await prisma.wallet_links.upsert({
        where: { 
          user_wallet_address: primaryWalletAddress 
        },
        create: { 
          id: randomUUID(),
          user_wallet_address: primaryWalletAddress,
        zora_wallet_address: zoraWalletAddress,
        linked_at: new Date()
      },
      update: { 
        zora_wallet_address: zoraWalletAddress,
        linked_at: new Date()
      }
    });
    }

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