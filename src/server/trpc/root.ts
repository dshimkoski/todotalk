import { helloRouter } from './routers/hello'
import { messageRouter } from './routers/message'
import { taskRouter } from './routers/task'
import { userRouter } from './routers/user'
import { router } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/trpc/routers should be manually added here.
 */
export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
  task: taskRouter,
  message: messageRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
