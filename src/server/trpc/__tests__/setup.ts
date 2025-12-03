import { afterAll, beforeAll } from 'vitest'
import { cleanDatabase, ensureTestDatabase, prisma } from './helpers'

// Set up test database schema and clean before all tests
beforeAll(async () => {
  await ensureTestDatabase()
  await cleanDatabase()
})

// Close Prisma connection after all tests finish
afterAll(async () => {
  await prisma.$disconnect()
})
