import { router } from './trpc'
import { helloRouter } from './routers/hello'

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/trpc/routers should be manually added here.
 */
export const appRouter = router({
  hello: helloRouter,
  // TODO: Add more routers as we create them
  // user: userRouter,
  // task: taskRouter,
  // message: messageRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
