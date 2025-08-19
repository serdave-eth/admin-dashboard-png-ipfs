import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { content } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';
import { setCurrentUserWallet } from '@/lib/rls';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = await verifyAuthToken(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Set RLS context for the authenticated user
    await setCurrentUserWallet(prisma, walletAddress);

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // For backwards compatibility, search by both wallet address and Privy DID
    // Extract Privy DID from the auth token for backwards compatibility 
    const authHeader = request.headers.get('authorization');
    let privyDid: string | null = null;
    try {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Decode JWT payload for Privy DID extraction
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        privyDid = payload.sub;
      }
    } catch (error) {
      // Silently continue if we can't extract the Privy DID
    }

    const where = {
      OR: [
        { user_wallet_address: walletAddress },
        ...(privyDid ? [{ user_wallet_address: privyDid }] : [])
      ],
      ...(cursor && {
        created_at: {
          lt: new Date(cursor),
        },
      }),
    };

    const items = await prisma.content.findMany({
      where,
      take: limit + 1,
      orderBy: {
        created_at: 'desc',
      },
    });

    const hasMore = items.length > limit;
    const itemsToReturn = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? items[items.length - 2].created_at.toISOString() : null;

    return NextResponse.json({
      items: itemsToReturn.map((item: content) => ({
        id: item.id,
        userWalletAddress: item.user_wallet_address,
        filename: item.filename,
        fileType: item.file_type,
        fileSize: item.file_size.toString(),
        ipfsCid: item.ipfs_cid,
        createdAt: item.created_at,
        coinContractAddress: item.coin_contract_address,
        minimumTokenAmount: item.minimum_token_amount,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}