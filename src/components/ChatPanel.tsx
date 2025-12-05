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

  const { data, fetchNextPage, hasNextPage, isLoading } =
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
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Talk
        </h2>
      </div>

      <div className="scrollbar flex-1 overflow-y-auto px-4 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No messages yet. Start talking!
          </p>
        ) : (
          <>
            {messages.reverse().map((msg, idx) => {
              const prevMsg = messages[idx - 1]
              const showHeader =
                !prevMsg ||
                prevMsg.authorId !== msg.authorId ||
                new Date(msg.createdAt).getTime() -
                  new Date(prevMsg.createdAt).getTime() >
                  300000

              return (
                <div
                  key={msg.id}
                  className={`group hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    showHeader ? 'mt-4' : 'mt-0.5'
                  }`}
                >
                  {showHeader ? (
                    <div className="flex gap-2 px-2 py-1">
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                        {(msg.author.name ||
                          msg.author.email)?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {msg.author.name || msg.author.email?.split('@')[0]}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 px-2 py-0.5">
                      <div className="w-8 flex-shrink-0 text-center">
                        <span className="hidden text-xs text-gray-500 group-hover:inline dark:text-gray-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 text-sm text-gray-900 dark:text-gray-100">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {hasNextPage && (
        <button
          onClick={() => void fetchNextPage()}
          className="mx-4 mb-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Load more messages
        </button>
      )}

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message #team-chat"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!message.trim() || createMessage.isPending}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
