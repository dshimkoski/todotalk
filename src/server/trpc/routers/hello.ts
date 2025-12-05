import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const helloRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
      }
    }),

  status: publicProcedure.query(() => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    }
  }),
})
