import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // Get distinct creators who have uploaded content
    const creatorsWithContent = await prisma.content.findMany({
      where: {
        coin_contract_address: {
          not: null
        }
      },
      select: {
        coin_contract_address: true
      },
      distinct: ['coin_contract_address']
    });

    // Extract unique addresses
    const creatorAddresses = creatorsWithContent
      .map(item => item.coin_contract_address)
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