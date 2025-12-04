'use client'

import type { Task } from '@prisma/client'
import { useOptimistic, useTransition } from 'react'
import { deleteTask, updateTaskStatus } from '../app/dashboard/actions'

interface TaskWithAssignee extends Task {
  assignee: {
    id: string
    name: string | null
    email: string
  } | null
}

interface TaskListProps {
  initialTasks: TaskWithAssignee[]
  teamId: string
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (
      state: TaskWithAssignee[],
      action: { type: string; taskId?: string; status?: string },
    ) => {
      switch (action.type) {
        case 'delete':
          return state.filter((task) => task.id !== action.taskId)
        case 'updateStatus':
          return state.map((task) =>
            task.id === action.taskId
              ? {
                  ...task,
                  status: action.status as 'todo' | 'in_progress' | 'done',
                }
              : task,
          )
        default:
          return state
      }
    },
  )

  function handleDelete(taskId: string) {
    startTransition(() => {
      setOptimisticTasks({ type: 'delete', taskId })
      void deleteTask(taskId)
    })
  }

  function handleStatusChange(taskId: string, newStatus: string) {
    startTransition(() => {
      setOptimisticTasks({ type: 'updateStatus', taskId, status: newStatus })
      void updateTaskStatus(taskId, newStatus)
    })
  }

  if (optimisticTasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No tasks yet. Create one to get started!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {optimisticTasks.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>

                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                      : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {task.priority}
                </span>

                {task.assignee && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Assigned to {task.assignee.name || task.assignee.email}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDelete(task.id)}
              className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              aria-label="Delete task"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
