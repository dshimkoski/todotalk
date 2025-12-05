'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ViewToggleProps {
  teamId: string
}

export function ViewToggle({ teamId }: ViewToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'todos'

  const handleViewChange = (newView: string) => {
    router.push(`/dashboard?team=${teamId}&view=${newView}`)
  }

  return (
    <div className="mt-2 flex w-full shrink-0 rounded-lg bg-gray-800 p-1 shadow-inner sm:mt-0 sm:w-auto lg:hidden dark:bg-gray-900">
      <button
        onClick={() => handleViewChange('todos')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
          view === 'todos'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        Todo
      </button>
      <button
        onClick={() => handleViewChange('talk')}
        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
          view === 'talk'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        Talk
      </button>
    </div>
  )
}
