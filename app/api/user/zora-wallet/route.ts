import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { PrivyClient } from '@privy-io/server-auth';

export async function GET(request: NextRequest) {
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

    // Fetch wallet linking information from database using Prisma ORM
    // RLS policy ensures only user's own wallet links are returned
    let walletLink = null;
    if (primaryWalletAddress) {
      walletLink = await prisma.wallet_links.findUnique({
        where: { 
          user_wallet_address: primaryWalletAddress 
        },
      select: {
        zora_wallet_address: true,
        linked_at: true
      }
    });
    }

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