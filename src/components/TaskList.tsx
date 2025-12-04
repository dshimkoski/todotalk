'use client'

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@prisma/client'
import { useOptimistic, useTransition } from 'react'
import {
  deleteTask,
  reorderTasks,
  updateTaskStatus,
} from '../app/dashboard/actions'

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

export function TaskList({ initialTasks, teamId }: TaskListProps) {
  const [, startTransition] = useTransition()
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    initialTasks,
    (
      state: TaskWithAssignee[],
      action: {
        type: string
        taskId?: string
        status?: string
        activeId?: string
        overId?: string
      },
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
        case 'reorder': {
          const oldIndex = state.findIndex((t) => t.id === action.activeId)
          const newIndex = state.findIndex((t) => t.id === action.overId)
          return arrayMove(state, oldIndex, newIndex)
        }
        default:
          return state
      }
    },
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Find the order value of the task we're dropping onto
      const targetTask = optimisticTasks.find((t) => t.id === over.id)
      if (!targetTask) return

      startTransition(() => {
        setOptimisticTasks({
          type: 'reorder',
          activeId: active.id as string,
          overId: over.id as string,
        })

        void reorderTasks(active.id as string, targetTask.order, teamId)
      })
    }
  }

  if (optimisticTasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No tasks yet. Create one to get started!
      </p>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={optimisticTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {optimisticTasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

interface SortableTaskProps {
  task: TaskWithAssignee
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

function SortableTask({ task, onDelete, onStatusChange }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Drag to reorder"
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
              d="M4 8h16M4 16h16"
            />
          </svg>
        </button>

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
              onChange={(e) => onStatusChange(task.id, e.target.value)}
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
          onClick={() => onDelete(task.id)}
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
  )
}
