import { PrismaClient } from '@prisma/client';

/**
 * Sets the current user wallet address in the database session
 * This enables Row Level Security policies to work correctly
 */
export async function setCurrentUserWallet(
  prisma: PrismaClient, 
  walletAddress: string
): Promise<void> {
  await prisma.$executeRaw`
    SELECT set_config('app.current_user_wallet', ${walletAddress}, true);
  `;
}

/**
 * Creates a Prisma client with RLS context for a specific wallet address
 * Use this in API routes after authentication
 */
export async function createAuthenticatedPrisma(
  basePrisma: PrismaClient,
  walletAddress: string
): Promise<PrismaClient> {
  // Set the user context for RLS policies
  await setCurrentUserWallet(basePrisma, walletAddress);
  return basePrisma;
}

/**
 * Clears the current user wallet address from the database session
 */
export async function clearCurrentUserWallet(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRaw`
    SELECT set_config('app.current_user_wallet', '', true);
  `;
}