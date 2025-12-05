import { serverEvents } from '@/server/events'
import type { Message } from '@prisma/client'
import { observable } from '@trpc/server/observable'
import { z } from 'zod'
import { messageInputSchema, messageListSchema } from '../schemas'
import { userPublicSelect } from '../selects'
import { publicProcedure, router } from '../trpc'

export const messageRouter = router({
  list: publicProcedure
    .input(messageListSchema)
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
            select: userPublicSelect,
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
    .input(messageInputSchema)
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: input,
        include: {
          author: {
            select: userPublicSelect,
          },
        },
      })

      // Emit event for real-time updates
      serverEvents.emit('message:created', message)

      return message
    }),

  // Real-time subscription for new messages
  onCreated: publicProcedure
    .input(z.object({ teamId: z.string() }))
    .subscription(({ input }) => {
      return observable<Message>((emit) => {
        const onMessage = (message: Message) => {
          if (message.teamId === input.teamId) {
            emit.next(message)
          }
        }

        serverEvents.on('message:created', onMessage)

        return () => {
          serverEvents.off('message:created', onMessage)
        }
      })
    }),
})
