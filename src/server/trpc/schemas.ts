/**
 * Shared Zod schemas for tRPC routers
 * Centralizes validation logic and promotes type reuse
 */
import { z } from 'zod'

// ===== Enums =====

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done'])
export const taskPrioritySchema = z.enum(['low', 'medium', 'high'])

// ===== Common Schemas =====

export const idSchema = z.string().uuid()
export const teamIdSchema = z.string()
export const userIdSchema = z.string()

export const paginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
})

// ===== Task Schemas =====

export const taskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: taskStatusSchema.default('todo'),
  priority: taskPrioritySchema.default('medium'),
  teamId: teamIdSchema,
  assigneeId: userIdSchema.optional(),
})

export const taskUpdateSchema = taskInputSchema
  .partial()
  .extend({
    id: idSchema,
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: 'At least one field must be provided for update',
  })

export const taskListSchema = z.object({
  teamId: teamIdSchema,
  status: taskStatusSchema.optional(),
})

export const taskReorderSchema = z.object({
  taskId: idSchema,
  newOrder: z.number().int().min(0),
  teamId: teamIdSchema,
})

// ===== Message Schemas =====

export const messageInputSchema = z.object({
  content: z.string().min(1).max(5000),
  teamId: teamIdSchema,
  authorId: userIdSchema,
})

export const messageListSchema = paginationSchema.extend({
  teamId: teamIdSchema,
})

// ===== User Schemas =====

export const userProfileSchema = z.object({
  userId: userIdSchema,
})

export const userUpdateSchema = z.object({
  userId: userIdSchema,
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
})

// ===== Type Exports =====

export type TaskStatus = z.infer<typeof taskStatusSchema>
export type TaskPriority = z.infer<typeof taskPrioritySchema>
export type TaskInput = z.infer<typeof taskInputSchema>
export type TaskUpdate = z.infer<typeof taskUpdateSchema>
export type TaskList = z.infer<typeof taskListSchema>
export type MessageInput = z.infer<typeof messageInputSchema>
export type MessageList = z.infer<typeof messageListSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
