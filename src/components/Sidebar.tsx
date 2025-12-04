'use client'

import type { Team } from '@prisma/client'
import { signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
  teams: Team[]
}

export function Sidebar({ user, teams }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    teams[0]?.id || '',
  )

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId)
    router.push(`/dashboard?team=${teamId}`)
  }

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          TodoTalk
        </h1>
      </div>

      {/* Team Switcher */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <label
          htmlFor="team-select"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Select Team
        </label>
        <select
          id="team-select"
          value={selectedTeamId}
          onChange={(e) => handleTeamChange(e.target.value)}
          className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
          }}
        >
          {teams.length === 0 ? (
            <option value="">No teams</option>
          ) : (
            teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <a
          href={`/dashboard?team=${selectedTeamId}`}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${
            pathname === '/dashboard'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
              : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <svg
            className="mr-3 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Tasks
        </a>
      </nav>

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
          className="mt-3 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
