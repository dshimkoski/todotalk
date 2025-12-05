'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/server/db'
import { serverEvents } from '@/server/events'
import {
  taskInputSchema,
  taskStatusSchema,
  type TaskStatus,
} from '@/server/trpc/schemas'
import { revalidatePath } from 'next/cache'

/**
 * Ensures user is authenticated before performing action
 * @throws Error if user is not authenticated
 */
async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Helper to emit task event and revalidate dashboard
 */
function emitTaskEvent(
  event: 'task:created' | 'task:updated' | 'task:deleted' | 'task:reordered',
  payload: { taskId?: string; teamId: string },
) {
  serverEvents.emit(event, payload)
  revalidatePath('/dashboard')
}

/**
 * Get next available order for a task in a team
 */
async function getNextTaskOrder(teamId: string): Promise<number> {
  const maxOrderTask = await prisma.task.findFirst({
    where: { teamId, deletedAt: null },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  return (maxOrderTask?.order ?? -1) + 1
}

export async function createTask(formData: FormData) {
  await requireAuth()

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    teamId: formData.get('teamId') as string,
    priority: (formData.get('priority') as string) || 'medium',
    assigneeId: formData.get('assigneeId') as string | null,
  }

  // Validate input using shared schema
  const input = taskInputSchema.parse({
    ...rawData,
    assigneeId: rawData.assigneeId || undefined,
  })

  const order = await getNextTaskOrder(input.teamId)

  const task = await prisma.task.create({
    data: {
      ...input,
      order,
    },
  })

  emitTaskEvent('task:created', { taskId: task.id, teamId: task.teamId })
  return task
}

export async function updateTask(formData: FormData) {
  await requireAuth()

  const id = formData.get('id') as string
  const data = {
    title: formData.get('title') as string,
    description: formData.get('description') as string | undefined,
    status: formData.get('status') as TaskStatus,
    priority: formData.get('priority') as 'low' | 'medium' | 'high',
    assigneeId: formData.get('assigneeId') as string | null,
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...data,
      assigneeId: data.assigneeId || null,
    },
  })

  emitTaskEvent('task:updated', { taskId: task.id, teamId: task.teamId })
  return task
}

export async function deleteTask(taskId: string) {
  await requireAuth()

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  })

  emitTaskEvent('task:deleted', { taskId, teamId: task.teamId })
}

export async function updateTaskStatus(taskId: string, status: string) {
  await requireAuth()

  // Validate status using schema
  const validStatus = taskStatusSchema.parse(status)

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: validStatus },
  })

  emitTaskEvent('task:updated', { taskId, teamId: task.teamId })
}

export async function reorderTasks(
  taskId: string,
  newOrder: number,
  teamId: string,
) {
  await requireAuth()

  // Get the task being moved
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { order: true },
  })

  if (!task) {
    throw new Error('Task not found')
  }

  const oldOrder = task.order

  // Skip if no movement
  if (oldOrder === newOrder) {
    return
  }

  // Shift other tasks to make room
  if (newOrder < oldOrder) {
    // Moving up - shift tasks down
    await prisma.task.updateMany({
      where: {
        teamId,
        deletedAt: null,
        order: {
          gte: newOrder,
          lt: oldOrder,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    })
  } else {
    // Moving down - shift tasks up
    await prisma.task.updateMany({
      where: {
        teamId,
        deletedAt: null,
        order: {
          gt: oldOrder,
          lte: newOrder,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    })
  }

  // Update the task's order
  await prisma.task.update({
    where: { id: taskId },
    data: { order: newOrder },
  })

  emitTaskEvent('task:reordered', { teamId })
}
