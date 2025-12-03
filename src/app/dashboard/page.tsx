import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TodoTalk
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-700 dark:text-gray-300">
                {session.user?.email}
              </span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {session.user?.name || session.user?.email}!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You are successfully authenticated.
          </p>
        </div>
      </main>
    </div>
  )
}
