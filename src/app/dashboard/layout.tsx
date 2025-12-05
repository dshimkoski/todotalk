import { Sidebar } from '@/components/Sidebar'
import { auth } from '@/lib/auth'
import { TRPCProvider } from '@/lib/trpc/provider'
import { ensureDatabaseConnection, prisma } from '@/server/db'
import { redirect } from 'next/navigation'
import { cache } from 'react'

// Cache team fetching for the request
const getUserTeamsForLayout = cache(async (userId: string) => {
  const userTeams = await prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
  })
  return userTeams.map((tm) => tm.team)
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Ensure database connection is ready
  try {
    await ensureDatabaseConnection()
  } catch (error) {
    console.error('Database connection failed in layout:', error)
    // Let the page handle the error display
  }

  const teams = await getUserTeamsForLayout(session.user.id)

  return (
    <TRPCProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar user={session.user} teams={teams} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </TRPCProvider>
  )
}
