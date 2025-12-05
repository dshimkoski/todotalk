import { z } from 'zod'
import { taskInputSchema, taskListSchema, taskReorderSchema } from '../schemas'
import {
  taskWithAssigneeSelect,
  taskWithRelationsSelect,
  userPublicSelect,
} from '../selects'
import { publicProcedure, router } from '../trpc'

export const taskRouter = router({
  list: publicProcedure.input(taskListSchema).query(async ({ ctx, input }) => {
    const tasks = await ctx.prisma.task.findMany({
      where: {
        teamId: input.teamId,
        status: input.status,
        deletedAt: null,
      },
      include: {
        assignee: {
          select: userPublicSelect,
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    return tasks
  }),

  getById: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.findUnique({
        where: { id: input.taskId },
        select: taskWithRelationsSelect,
      })

      if (!task || task.deletedAt) {
        throw new Error('Task not found')
      }

      return task
    }),

  create: publicProcedure
    .input(taskInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Get the max order for this team
      const maxOrder = await ctx.prisma.task.findFirst({
        where: { teamId: input.teamId, deletedAt: null },
        orderBy: { order: 'desc' },
        select: { order: true },
      })

      const task = await ctx.prisma.task.create({
        data: {
          ...input,
          order: (maxOrder?.order ?? -1) + 1,
        },
        select: taskWithAssigneeSelect,
      })

      return task
    }),

  update: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'done']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        assigneeId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { taskId, ...data } = input

      const task = await ctx.prisma.task.update({
        where: { id: taskId },
        data,
        select: taskWithAssigneeSelect,
      })

      return task
    }),

  delete: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Soft delete
      const task = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: { deletedAt: new Date() },
      })

      return { success: true, taskId: task.id }
    }),

  reorder: publicProcedure
    .input(taskReorderSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: { order: input.newOrder },
      })

      return task
    }),
})
