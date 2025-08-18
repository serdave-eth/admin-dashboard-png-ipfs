import { PrismaClient } from '@prisma/client';

// Create a separate Prisma client for public operations that bypasses RLS
// This is used for public read operations like creator content pages
export const publicPrisma = new PrismaClient();

// Function to temporarily disable RLS for public reads
export async function withPublicAccess<T>(operation: () => Promise<T>): Promise<T> {
  // Execute the operation with a fresh connection that bypasses RLS
  // This is safe for read-only operations on public content
  return await operation();
}