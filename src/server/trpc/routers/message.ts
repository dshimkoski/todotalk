import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const messageRouter = router({
  list: publicProcedure
    .input(
      z.object({
        teamId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          teamId: input.teamId,
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      let nextCursor: string | null = null
      if (messages.length > input.limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id ?? null
      }

      return {
        items: messages, // Already desc ordered (newest first)
        nextCursor,
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        content: z.string().min(1),
        teamId: z.string(),
        authorId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: input,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // TODO: Emit event for real-time updates
      // eventEmitter.emit('message:created', { teamId: input.teamId, message })

      return message
    }),

  // Placeholder for subscription endpoint
  // Will be implemented with SSE/WebSocket in Phase 4
  onCreated: publicProcedure
    .input(z.object({ teamId: z.string() }))
    .subscription(async function* () {
      // TODO: Implement with EventEmitter or Redis PubSub
      // For now, just a placeholder
      yield {
        message: 'Subscription placeholder - will be implemented in Phase 4',
      }
    }),
})
