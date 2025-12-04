import { CreateTaskForm } from '@/components/CreateTaskForm'
import { TaskList } from '@/components/TaskList'
import { auth } from '@/lib/auth'
import { prisma } from '@/server/db'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const params = await searchParams
  const teamId = params.team

  // Get user's teams
  const userTeams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      team: true,
    },
  })

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

  // Get tasks for selected team
  const tasks = await prisma.task.findMany({
    where: {
      teamId: selectedTeam.id,
      deletedAt: null,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  // Get team members for assignee dropdown
  const teamMembers = await prisma.teamMember.findMany({
    where: {
      teamId: selectedTeam.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  const users = teamMembers.map((tm) => tm.user)

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {selectedTeam.name}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your team&apos;s tasks and chat
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Tasks
            </h2>

            <div className="mb-4">
              <CreateTaskForm teamId={selectedTeam.id} teamMembers={users} />
            </div>

            <TaskList initialTasks={tasks} teamId={selectedTeam.id} />
          </div>
        </div>

        {/* Chat Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Team Chat
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chat functionality coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
