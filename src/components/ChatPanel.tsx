'use client'

import { trpc } from '@/lib/trpc/provider'
import { useEffect, useRef, useState } from 'react'

interface ChatPanelProps {
  teamId: string
  userId: string
  userName: string | null
}

export function ChatPanel({ teamId, userId }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const utils = trpc.useUtils()

  const { data, fetchNextPage, hasNextPage } =
    trpc.message.list.useInfiniteQuery(
      {
        teamId,
        limit: 50,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    )

  const createMessage = trpc.message.create.useMutation({
    onSuccess: () => {
      void utils.message.list.invalidate()
    },
  })

  // Set up EventSource for real-time updates
  useEffect(() => {
    const eventSource = new EventSource(`/api/events?teamId=${teamId}`)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as { type: string; data?: unknown }
      if (data.type === 'message') {
        void utils.message.list.invalidate()
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [teamId, utils.message.list])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    createMessage.mutate({
      content: message,
      teamId,
      authorId: userId,
    })

    setMessage('')
  }

  const messages = data?.pages.flatMap((page) => page.items) ?? []

  return (
    <div className="flex h-full flex-col rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Team Chat
        </h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </p>
        ) : (
          <>
            {messages.reverse().map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.authorId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 ${
                    msg.authorId === userId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                  }`}
                >
                  <div className="text-xs font-medium opacity-75">
                    {msg.author.name || msg.author.email}
                  </div>
                  <div className="mt-1">{msg.content}</div>
                  <div className="mt-1 text-xs opacity-75">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {hasNextPage && (
        <button
          onClick={() => void fetchNextPage()}
          className="mx-4 mb-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Load more messages
        </button>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 dark:border-gray-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={!message.trim() || createMessage.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
