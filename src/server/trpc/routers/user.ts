import { userProfileSchema, userUpdateSchema } from '../schemas'
import { userPublicSelect } from '../selects'
import { publicProcedure, router } from '../trpc'

export const userRouter = router({
  getProfile: publicProcedure
    .input(userProfileSchema)
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
        select: {
          ...userPublicSelect,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    }),

  updateProfile: publicProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input

      const user = await ctx.prisma.user.update({
        where: { id: userId },
        data,
        select: {
          ...userPublicSelect,
          updatedAt: true,
        },
      })

      return user
    }),

  listUsers: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        ...userPublicSelect,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return users
  }),
})
