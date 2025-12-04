import { Sidebar } from '@/components/Sidebar'
import { auth } from '@/lib/auth'
import { prisma } from '@/server/db'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user's teams
  const userTeams = await prisma.teamMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      team: true,
    },
  })

  const teams = userTeams.map((tm) => tm.team)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar user={session.user} teams={teams} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
