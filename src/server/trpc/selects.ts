/**
 * Shared Prisma select objects
 * Ensures consistent data shapes across API responses
 */
import type { Prisma } from '@prisma/client'

// ===== User Selects =====

export const userPublicSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect

export const userMinimalSelect = {
  id: true,
  name: true,
} satisfies Prisma.UserSelect

// ===== Team Selects =====

export const teamBasicSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.TeamSelect

export const teamWithMembersSelect = {
  id: true,
  name: true,
  slug: true,
  members: {
    select: userPublicSelect,
  },
} satisfies Prisma.TeamSelect

// ===== Task Selects =====

export const taskBasicSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.TaskSelect

export const taskWithAssigneeSelect = {
  ...taskBasicSelect,
  assignee: {
    select: userPublicSelect,
  },
} satisfies Prisma.TaskSelect

export const taskWithRelationsSelect = {
  ...taskBasicSelect,
  assignee: {
    select: userPublicSelect,
  },
  team: {
    select: teamBasicSelect,
  },
} satisfies Prisma.TaskSelect

// ===== Message Selects =====

export const messageBasicSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MessageSelect

export const messageWithAuthorSelect = {
  ...messageBasicSelect,
  author: {
    select: userPublicSelect,
  },
} satisfies Prisma.MessageSelect

// ===== Type Exports =====
// Use Prisma's type helpers to infer the actual return types

export type UserPublic = Prisma.UserGetPayload<{
  select: typeof userPublicSelect
}>

export type UserMinimal = Prisma.UserGetPayload<{
  select: typeof userMinimalSelect
}>

export type TeamBasic = Prisma.TeamGetPayload<{
  select: typeof teamBasicSelect
}>

export type TeamWithMembers = Prisma.TeamGetPayload<{
  select: typeof teamWithMembersSelect
}>

export type TaskBasic = Prisma.TaskGetPayload<{
  select: typeof taskBasicSelect
}>

export type TaskWithAssignee = Prisma.TaskGetPayload<{
  select: typeof taskWithAssigneeSelect
}>

export type TaskWithRelations = Prisma.TaskGetPayload<{
  select: typeof taskWithRelationsSelect
}>

export type MessageBasic = Prisma.MessageGetPayload<{
  select: typeof messageBasicSelect
}>

export type MessageWithAuthor = Prisma.MessageGetPayload<{
  select: typeof messageWithAuthorSelect
}>
