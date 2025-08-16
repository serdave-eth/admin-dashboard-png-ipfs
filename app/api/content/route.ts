import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { Content } from '@prisma/client';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const walletAddress = await verifyAuthToken(request);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where = {
      userWalletAddress: walletAddress,
      ...(cursor && {
        createdAt: {
          lt: new Date(cursor),
        },
      }),
    };

    const items = await prisma.content.findMany({
      where,
      take: limit + 1,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasMore = items.length > limit;
    const itemsToReturn = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? items[items.length - 2].createdAt.toISOString() : null;

    return NextResponse.json({
      items: itemsToReturn.map((item: Content) => ({
        ...item,
        fileSize: item.fileSize.toString(),
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