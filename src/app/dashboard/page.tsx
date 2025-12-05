import { ChatPanel } from '@/components/ChatPanel'
import { ClientTaskList } from '@/components/ClientTaskList'
import { CreateTaskForm } from '@/components/CreateTaskForm'
import { ViewToggle } from '@/components/ViewToggle'
import { auth } from '@/lib/auth'
import { ensureDatabaseConnection, prisma } from '@/server/db'
import { userPublicSelect } from '@/server/trpc/selects'
import { redirect } from 'next/navigation'
import { cache } from 'react'

// Revalidate every 30 seconds for fresh data without sacrificing performance
export const revalidate = 30

// Cache user teams for the request lifecycle
const getUserTeams = cache(async (userId: string) => {
  return prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
  })
})

// Cache tasks with optimized query
const getTeamTasks = cache(async (teamId: string) => {
  return prisma.task.findMany({
    where: {
      teamId,
      deletedAt: null,
    },
    orderBy: { order: 'asc' },
    include: {
      assignee: {
        select: userPublicSelect,
      },
    },
  })
})

// Cache team members
const getTeamMembers = cache(async (teamId: string) => {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: userPublicSelect,
      },
    },
  })
  return members.map((tm) => tm.user)
})

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string; view?: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Ensure database connection is ready (handles cold starts)
  try {
    await ensureDatabaseConnection()
  } catch (error) {
    console.error('Database connection failed:', error)
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Connecting to database...
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The database is starting up. Please refresh in a moment.
          </p>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const teamId = params.team
  const view = params.view

  // Use cached data fetching functions
  const userTeams = await getUserTeams(session.user.id)

  const selectedTeam =
    userTeams.find((tm) => tm.team.id === teamId)?.team || userTeams[0]?.team

  if (!selectedTeam) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            No teams found
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You are not a member of any teams yet.
          </p>
        </div>
      </div>
    )
  }

  // Fetch data in parallel for better performance
  const [tasks, users] = await Promise.all([
    getTeamTasks(selectedTeam.id),
    getTeamMembers(selectedTeam.id),
  ])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-700 bg-gray-800 px-4 py-4 shadow-sm sm:px-6 sm:py-5 lg:flex lg:h-16 lg:items-center lg:px-8 lg:py-0 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex items-center justify-center lg:mx-0 lg:w-full lg:justify-start">
          <h1 className="min-w-0 text-center text-xl font-bold text-white sm:text-2xl lg:text-left dark:text-white">
            {selectedTeam.name}
          </h1>
        </div>
        <div className="mx-auto mt-3 max-w-md lg:hidden">
          <ViewToggle teamId={selectedTeam.id} />
        </div>
      </div>

      <div className="grid flex-1 gap-4 overflow-hidden p-4 sm:gap-6 sm:p-8 lg:grid-cols-2">
        {/* Todos Section */}
        <div
          className={`flex flex-col overflow-hidden lg:col-span-1 ${
            view === 'talk' ? 'hidden lg:flex' : ''
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
            <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-white">
                Todo
              </h2>
            </div>

            <div className="border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700">
              <CreateTaskForm teamId={selectedTeam.id} teamMembers={users} />
            </div>

            <div className="scrollbar flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
              <ClientTaskList initialTasks={tasks} teamId={selectedTeam.id} />
            </div>
          </div>
        </div>

        {/* Talk Section */}
        <div
          className={`flex flex-col overflow-hidden lg:col-span-1 ${
            view !== 'talk' && view !== undefined
              ? 'hidden lg:flex'
              : view === undefined
                ? 'hidden lg:flex'
                : ''
          }`}
        >
          <ChatPanel
            teamId={selectedTeam.id}
            userId={session.user.id}
            userName={session.user.name}
          />
        </div>
      </div>
    </div>
  )
}
