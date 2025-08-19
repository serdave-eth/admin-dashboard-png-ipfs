import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Get content counts for all creators in one query
    const creatorCounts = await prisma.content.groupBy({
      by: ['coin_contract_address'],
      where: {
        coin_contract_address: {
          not: null
        }
      },
      _count: {
        id: true
      }
    });

    // Transform into a map for easy lookup
    const countsMap = creatorCounts.reduce((acc, item) => {
      if (item.coin_contract_address) {
        acc[item.coin_contract_address] = item._count.id;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ 
      counts: countsMap
    });
  } catch (error) {
    console.error('Failed to fetch creator counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creator counts' },
      { status: 500 }
    );
  }
}