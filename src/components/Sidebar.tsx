'use client'

import type { Team } from '@prisma/client'
import { signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface SidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
  teams: Team[]
}

export function Sidebar({ user, teams }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null)
  const currentTeamId = searchParams.get('team') || teams[0]?.id || ''
  const view = searchParams.get('view') || 'todos'

  const handleTeamChange = (teamId: string) => {
    setPendingTeamId(teamId)
    startTransition(() => {
      router.push(`/dashboard?team=${teamId}&view=${view}`)
      setIsMobileMenuOpen(false)
    })
  }

  // Clear pending team when transition completes
  if (!isPending && pendingTeamId) {
    setPendingTeamId(null)
  }

  const handleTeamHover = (teamId: string) => {
    router.prefetch(`/dashboard?team=${teamId}&view=${view}`)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 right-4 z-50 mb-4 rounded-md bg-blue-600 p-1.5 text-white shadow-lg sm:p-2 lg:hidden"
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5 sm:h-6 sm:w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 dark:border-gray-700 dark:bg-gray-800 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            TodoTalk
          </h1>
        </div>

        {/* Teams List */}
        <div className="flex-1 overflow-y-auto border-b border-gray-200 p-2 dark:border-gray-700">
          <div className="mb-2 px-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">
            Teams
          </div>
          {teams.length === 0 ? (
            <div className="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">
              No teams
            </div>
          ) : (
            <div className="space-y-1">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamChange(team.id)}
                  onMouseEnter={() => handleTeamHover(team.id)}
                  disabled={isPending}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors disabled:cursor-wait disabled:opacity-70 ${
                    currentTeamId === team.id
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
                      {team.name[0]?.toUpperCase()}
                    </span>
                    <span className="flex-1 truncate">{team.name}</span>
                    {pendingTeamId === team.id && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => void signOut({ callbackUrl: '/login' })}
            type="button"
            className="mt-3 w-full cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}
