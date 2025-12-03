import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

const taskStatusEnum = z.enum(['todo', 'in_progress', 'done'])
const taskPriorityEnum = z.enum(['low', 'medium', 'high'])

export const taskRouter = router({
  list: publicProcedure
    .input(
      z.object({
        teamId: z.string(),
        status: taskStatusEnum.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.prisma.task.findMany({
        where: {
          teamId: input.teamId,
          status: input.status,
          deletedAt: null,
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
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
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      if (!task || task.deletedAt) {
        throw new Error('Task not found')
      }

      return task
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: taskStatusEnum.default('todo'),
        priority: taskPriorityEnum.default('medium'),
        teamId: z.string(),
        assigneeId: z.string().optional(),
      }),
    )
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
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return task
    }),

  update: publicProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        status: taskStatusEnum.optional(),
        priority: taskPriorityEnum.optional(),
        assigneeId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { taskId, ...data } = input

      const task = await ctx.prisma.task.update({
        where: { id: taskId },
        data,
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
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
    .input(
      z.object({
        taskId: z.string(),
        newOrder: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.prisma.task.update({
        where: { id: input.taskId },
        data: { order: input.newOrder },
      })

      return task
    }),
})
