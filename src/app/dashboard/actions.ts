'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/server/db'
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

  revalidatePath('/dashboard')
  return task
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  })

  revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: status as 'todo' | 'in_progress' | 'done' },
  })

  revalidatePath('/dashboard')
}
