import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Get distinct creators who have uploaded content
    const creatorsWithContent = await prisma.content.findMany({
      where: {
        coinContractAddress: {
          not: null
        }
      },
      select: {
        coinContractAddress: true
      },
      distinct: ['coinContractAddress']
    });

    // Extract unique addresses
    const creatorAddresses = creatorsWithContent
      .map(item => item.coinContractAddress)
      .filter(Boolean) as string[];

    return NextResponse.json({ 
      creators: creatorAddresses,
      count: creatorAddresses.length 
    });
  } catch (error) {
    console.error('Failed to fetch creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}