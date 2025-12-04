import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { Context } from './context'

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof Error && error.cause.name === 'ZodError'
            ? error.cause
            : null,
      },
    }
  },
})

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure

/**
 * Protected procedure - requires authentication
 * Will be used once we implement auth
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      // Infers the session is non-nullable
      session: ctx.session,
    },
  })
})
