import { beforeEach, describe, expect, it } from 'vitest'
import { messageRouter } from '../routers/message'
import { cleanDatabase, prisma } from './helpers'

const caller = messageRouter.createCaller({ prisma, session: null })

describe('messageRouter', () => {
  let team: { id: string; name: string; slug: string }
  let user: { id: string; email: string; name: string }

  beforeEach(async () => {
    await cleanDatabase()

    user = await prisma.user.create({
      data: {
        email: `message-${Date.now()}-${Math.random()}@example.com`,
        name: 'Test User',
        password: 'hashed',
      },
    })

    team = await prisma.team.create({
      data: {
        name: 'Test Team',
        slug: `test-team-${Date.now()}-${Math.random()}`,
      },
    })
  })

  describe('create', () => {
    it('should create a message', async () => {
      const result = await caller.create({
        content: 'Hello team!',
        teamId: team.id,
        authorId: user.id,
      })

      expect(result).toMatchObject({
        content: 'Hello team!',
        teamId: team.id,
        authorId: user.id,
      })
      expect(result.author).toMatchObject({
        id: user.id,
        name: 'Test User',
      })
    })
  })

  describe('list', () => {
    it('should return messages for a team', async () => {
      await caller.create({
        content: 'Message 1',
        teamId: team.id,
        authorId: user.id,
      })

      await caller.create({
        content: 'Message 2',
        teamId: team.id,
        authorId: user.id,
      })

      const result = await caller.list({ teamId: team.id })

      expect(result.items).toHaveLength(2)
      expect(result.items[0].content).toBe('Message 2') // Most recent first
      expect(result.items[1].content).toBe('Message 1')
    })

    it('should support cursor pagination', async () => {
      const messages = []
      for (let i = 1; i <= 5; i++) {
        const msg = await caller.create({
          content: `Message ${i}`,
          teamId: team.id,
          authorId: user.id,
        })
        messages.push(msg)
      }

      // Get first 3 messages
      const page1 = await caller.list({
        teamId: team.id,
        limit: 3,
      })

      expect(page1.items).toHaveLength(3)
      expect(page1.nextCursor).toBeDefined()

      // Get next 2 messages
      const page2 = await caller.list({
        teamId: team.id,
        limit: 3,
        cursor: page1.nextCursor,
      })

      expect(page2.items).toHaveLength(2)
      expect(page2.nextCursor).toBeNull()
    })

    it('should respect limit parameter', async () => {
      for (let i = 1; i <= 5; i++) {
        await caller.create({
          content: `Message ${i}`,
          teamId: team.id,
          authorId: user.id,
        })
      }

      const result = await caller.list({
        teamId: team.id,
        limit: 2,
      })

      expect(result.items).toHaveLength(2)
    })

    it('should include author information', async () => {
      await caller.create({
        content: 'Test message',
        teamId: team.id,
        authorId: user.id,
      })

      const result = await caller.list({ teamId: team.id })

      expect(result.items[0].author).toMatchObject({
        id: user.id,
        name: 'Test User',
        email: user.email,
      })
      expect(result.items[0].author).not.toHaveProperty('password')
    })
  })
})
