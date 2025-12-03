import { auth, signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  async function handleLogin(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signIn('credentials', {
        email,
        password,
        redirectTo: '/dashboard',
      })
    } catch (error) {
      if (error instanceof AuthError) {
        // NextAuth redirects on success, so this is actually an error
        console.error('Login failed:', error)
      }
      throw error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow dark:bg-gray-800">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to TodoTalk
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Demo accounts: alice@example.com, bob@example.com, or
            charlie@example.com
            <br />
            Password: demo123
          </p>
        </div>
        <form action={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Email address"
                defaultValue="alice@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Password"
                defaultValue="demo123"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
