'use client'

import { trpc } from '@/lib/trpc/provider'

export function TRPCTest() {
  const { data, isLoading } = trpc.hello.hello.useQuery({ name: 'tRPC' })
  const { data: status } = trpc.hello.status.useQuery()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-2 text-lg font-semibold">tRPC Test</h2>
      <p className="mb-2">
        <strong>Greeting:</strong> {data?.greeting}
      </p>
      {status && (
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong>Status:</strong> {status.status}
          </p>
          <p>
            <strong>Database:</strong> {status.database}
          </p>
          <p>
            <strong>Time:</strong> {new Date(status.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}
