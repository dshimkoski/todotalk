import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection retry configuration for Fly.io auto-start
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Helper to check database connectivity with retry logic
 * Used during cold starts when database might be waking up
 */
export async function ensureDatabaseConnection(maxRetries = 5) {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Simple connectivity check
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch (error) {
      lastError = error as Error
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      // Check if it's a "database is starting up" error
      if (
        errorMessage.includes('starting up') ||
        errorMessage.includes('connection refused') ||
        errorMessage.includes('ECONNREFUSED')
      ) {
        if (attempt < maxRetries) {
          // Exponential backoff: 500ms, 1s, 2s, 4s, 8s
          const delay = Math.min(500 * Math.pow(2, attempt - 1), 8000)
          console.log(
            `Database not ready (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
          )
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }
      }

      // Non-retryable error or max retries reached
      throw error
    }
  }

  throw lastError || new Error('Failed to connect to database')
}
