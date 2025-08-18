import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { content } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coinAddress: string }> }
) {
  try {
    const { coinAddress } = await params;
    
    if (!coinAddress) {
      return NextResponse.json(
        { success: false, error: 'Coin address is required' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const where = {
      coin_contract_address: coinAddress,
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
        ...item,
        fileSize: item.file_size.toString(),
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error('Fetch creator content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch creator content' },
      { status: 500 }
    );
  }
}