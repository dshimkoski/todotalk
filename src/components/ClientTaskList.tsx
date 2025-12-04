'use client'

import type { Task } from '@prisma/client'
import dynamic from 'next/dynamic'

interface TaskWithAssignee extends Task {
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
}

interface ClientTaskListProps {
  initialTasks: TaskWithAssignee[]
  teamId: string
}

const TaskList = dynamic(
  () => import('./TaskList').then((mod) => ({ default: mod.TaskList })),
  { ssr: false },
)

export function ClientTaskList({ initialTasks, teamId }: ClientTaskListProps) {
  return <TaskList initialTasks={initialTasks} teamId={teamId} />
}
