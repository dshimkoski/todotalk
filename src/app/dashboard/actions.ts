'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/server/db'
import { serverEvents } from '@/server/events'
import { revalidatePath } from 'next/cache'

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const teamId = formData.get('teamId') as string
  const priority = (formData.get('priority') as string) || 'medium'
  const assigneeId = formData.get('assigneeId') as string | null

  // Get the current max order for this team
  const maxOrderTask = await prisma.task.findFirst({
    where: { teamId, deletedAt: null },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const newOrder = (maxOrderTask?.order ?? -1) + 1

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      teamId,
      priority: priority as 'low' | 'medium' | 'high',
      assigneeId: assigneeId || null,
      status: 'todo',
      order: newOrder,
    },
  })

  serverEvents.emit('task:created', { taskId: task.id, teamId })
  revalidatePath('/dashboard')
  return task
}

export async function updateTask(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const priority = formData.get('priority') as string
  const assigneeId = formData.get('assigneeId') as string | null

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description: description || null,
      status: status as 'todo' | 'in_progress' | 'done',
      priority: priority as 'low' | 'medium' | 'high',
      assigneeId: assigneeId || null,
    },
  })

  serverEvents.emit('task:updated', { taskId: task.id, teamId: task.teamId })
  revalidatePath('/dashboard')
  return task
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  })

  serverEvents.emit('task:deleted', { taskId, teamId: task.teamId })
  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: status as 'todo' | 'in_progress' | 'done' },
  })

  serverEvents.emit('task:updated', { taskId, teamId: task.teamId })
  revalidatePath('/dashboard')
}

export async function reorderTasks(
  taskId: string,
  newOrder: number,
  teamId: string,
) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Get the task being moved
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { order: true },
  })

  if (!task) {
    throw new Error('Task not found')
  }

  const oldOrder = task.order

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
  } else if (newOrder > oldOrder) {
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

  serverEvents.emit('task:reordered', { teamId })
  revalidatePath('/dashboard')
}
