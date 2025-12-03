import { beforeEach, describe, expect, it } from 'vitest'
import { taskRouter } from '../routers/task'
import { cleanDatabase, prisma } from './helpers'

const caller = taskRouter.createCaller({ prisma, session: null })

describe('taskRouter', () => {
  let team: { id: string; name: string; slug: string }
  let user: { id: string; email: string; name: string | null }

  beforeEach(async () => {
    await cleanDatabase()

    user = await prisma.user.create({
      data: {
        email: `task-${Date.now()}-${Math.random()}@example.com`,
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
    it('should create a task', async () => {
      const result = await caller.create({
        title: 'Test Task',
        description: 'Test Description',
        teamId: team.id,
        assigneeId: user.id,
        status: 'todo',
        priority: 'high',
      })

      expect(result).toMatchObject({
        title: 'Test Task',
        description: 'Test Description',
        status: 'todo',
        priority: 'high',
        order: 0,
      })
      expect(result.assignee).toMatchObject({
        id: user.id,
        name: 'Test User',
      })
    })

    it('should auto-increment order', async () => {
      const task1 = await caller.create({
        title: 'Task 1',
        teamId: team.id,
      })

      const task2 = await caller.create({
        title: 'Task 2',
        teamId: team.id,
      })

      expect(task1.order).toBe(0)
      expect(task2.order).toBe(1)
    })
  })

  describe('list', () => {
    it('should return tasks for a team', async () => {
      await caller.create({
        title: 'Task 1',
        teamId: team.id,
        status: 'todo',
      })

      await caller.create({
        title: 'Task 2',
        teamId: team.id,
        status: 'done',
      })

      const result = await caller.list({ teamId: team.id })

      expect(result).toHaveLength(2)
    })

    it('should filter by status', async () => {
      await caller.create({
        title: 'Task 1',
        teamId: team.id,
        status: 'todo',
      })

      await caller.create({
        title: 'Task 2',
        teamId: team.id,
        status: 'done',
      })

      const result = await caller.list({ teamId: team.id, status: 'todo' })

      expect(result).toHaveLength(1)
      expect(result[0].status).toBe('todo')
    })

    it('should not return deleted tasks', async () => {
      const task = await caller.create({
        title: 'Task 1',
        teamId: team.id,
      })

      await caller.delete({ taskId: task.id })

      const result = await caller.list({ teamId: team.id })

      expect(result).toHaveLength(0)
    })
  })

  describe('update', () => {
    it('should update task fields', async () => {
      const task = await caller.create({
        title: 'Original Title',
        teamId: team.id,
      })

      const result = await caller.update({
        taskId: task.id,
        title: 'Updated Title',
        status: 'in_progress',
      })

      expect(result.title).toBe('Updated Title')
      expect(result.status).toBe('in_progress')
    })
  })

  describe('delete', () => {
    it('should soft delete a task', async () => {
      const task = await caller.create({
        title: 'Task to Delete',
        teamId: team.id,
      })

      const result = await caller.delete({ taskId: task.id })

      expect(result.success).toBe(true)

      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      })

      expect(deletedTask?.deletedAt).not.toBeNull()
    })
  })

  describe('getById', () => {
    it('should return task with relations', async () => {
      const task = await caller.create({
        title: 'Test Task',
        teamId: team.id,
        assigneeId: user.id,
      })

      const result = await caller.getById({ taskId: task.id })

      expect(result.title).toBe('Test Task')
      expect(result.assignee).toMatchObject({
        id: user.id,
        name: 'Test User',
      })
      expect(result.team).toMatchObject({
        id: team.id,
        name: 'Test Team',
      })
    })

    it('should throw error for deleted task', async () => {
      const task = await caller.create({
        title: 'Task',
        teamId: team.id,
      })

      await caller.delete({ taskId: task.id })

      await expect(caller.getById({ taskId: task.id })).rejects.toThrow(
        'Task not found',
      )
    })
  })
})
