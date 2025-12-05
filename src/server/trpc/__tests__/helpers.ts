import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import 'dotenv/config'
import { Pool } from 'pg'

// Use separate test database
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  process.env.DATABASE_URL?.replace('/todotalk', '/todotalk_test')

if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set')
}

const pool = new Pool({
  connectionString: TEST_DATABASE_URL,
})
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })

let isSchemaReady = false
let schemaPromise: Promise<void> | null = null

export async function ensureTestDatabase() {
  if (isSchemaReady) return

  // Ensure only one schema push happens even with concurrent calls
  if (schemaPromise) {
    return schemaPromise
  }

  schemaPromise = (async () => {
    // Run migrations on test database
    // Prisma 7 uses prisma.config.ts which reads from env.DATABASE_URL
    try {
      execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', {
        stdio: 'pipe', // Suppress output
        env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
      })
    } catch (error) {
      // Tests will skip if DB is not available
      console.warn('Failed to run migrations, tests will be skipped:', error)
    }

    isSchemaReady = true
  })()

  return schemaPromise
}

export async function cleanDatabase() {
  await prisma.message.deleteMany()
  await prisma.task.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.user.deleteMany()
}

export function setupTestDatabase() {
  beforeEach(async () => {
    await cleanDatabase()
  })
}
