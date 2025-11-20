/**
 * Prisma Client Singleton
 *
 * Provides a single Prisma Client instance throughout the application lifecycle.
 * Handles connection pooling and graceful shutdown.
 */

import { PrismaClient } from '../../generated/prisma/index.js'

let prismaClientInstance: PrismaClient | null = null

/**
 * Gets or creates the Prisma Client singleton instance
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  }
  return prismaClientInstance
}

/**
 * Disconnects the Prisma Client
 * Should be called during application shutdown
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaClientInstance) {
    await prismaClientInstance.$disconnect()
    prismaClientInstance = null
  }
}
