import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { Content } from '@prisma/client';
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

    const where = {
      // Note: user_wallet_address filter is now handled by RLS policy
      // but keeping it for explicit filtering and better query optimization
      user_wallet_address: walletAddress,
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
      items: itemsToReturn.map((item: Content) => ({
        ...item,
        fileSize: item.file_size.toString(),
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