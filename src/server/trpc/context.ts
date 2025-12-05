import type { inferAsyncReturnType } from '@trpc/server'
import { prisma } from '../db'

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export async function createContext() {
  // For demo purposes, we'll add session/auth later
  return {
    prisma,
    // Add user session here when auth is implemented
    session: null,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
