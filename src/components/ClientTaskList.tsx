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
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
      </div>
    ),
  },
)

export function ClientTaskList({ initialTasks, teamId }: ClientTaskListProps) {
  return <TaskList initialTasks={initialTasks} teamId={teamId} />
}
