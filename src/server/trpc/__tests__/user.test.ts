import { beforeEach, describe, expect, it } from 'vitest'
import { userRouter } from '../routers/user'
import { cleanDatabase, prisma } from './helpers'

const caller = userRouter.createCaller({ prisma, session: null })

beforeEach(async () => {
  await cleanDatabase()
})

describe('userRouter', () => {
  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = await prisma.user.create({
        data: {
          email: `getprofile-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'hashed_password',
        },
      })

      const result = await caller.getProfile({ userId: user.id })

      expect(result).toMatchObject({
        id: user.id,
        email: user.email,
        name: 'Test User',
      })
      expect(result).not.toHaveProperty('password')
    })

    it('should throw error for non-existent user', async () => {
      await expect(
        caller.getProfile({ userId: 'non-existent' }),
      ).rejects.toThrow('User not found')
    })
  })

  describe('updateProfile', () => {
    it('should update user name', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Old Name',
          password: 'hashed',
        },
      })

      const result = await caller.updateProfile({
        userId: user.id,
        name: 'New Name',
      })

      expect(result.name).toBe('New Name')
      expect(result.email).toBe('test@example.com')
    })
  })

  describe('listUsers', () => {
    it('should return all users', async () => {
      await prisma.user.createMany({
        data: [
          { email: 'user1@example.com', name: 'User 1', password: 'hash' },
          { email: 'user2@example.com', name: 'User 2', password: 'hash' },
          { email: 'user3@example.com', name: 'User 3', password: 'hash' },
        ],
      })

      const result = await caller.listUsers()

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveProperty('email')
      expect(result[0]).not.toHaveProperty('password')
    })

    it('should return empty array when no users', async () => {
      const result = await caller.listUsers()
      expect(result).toEqual([])
    })
  })
})
