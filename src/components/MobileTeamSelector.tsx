'use client'

import { useRouter } from 'next/navigation'

interface Team {
  id: string
  name: string
}

interface MobileTeamSelectorProps {
  teams: Team[]
  selectedTeamId: string
}

export function MobileTeamSelector({
  teams,
  selectedTeamId,
}: MobileTeamSelectorProps) {
  const router = useRouter()

  return (
    <div className="mb-3 lg:hidden">
      <select
        value={selectedTeamId}
        onChange={(e) => {
          const teamId = e.target.value
          router.push(`/dashboard?team=${teamId}`)
        }}
        className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
        }}
      >
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  )
}
