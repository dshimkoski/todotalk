import { serverEvents } from '@/server/events'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const teamId = searchParams.get('teamId')

  if (!teamId) {
    return new Response('Missing teamId parameter', { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = `data: ${JSON.stringify({ type: 'connected', teamId })}\n\n`
      controller.enqueue(encoder.encode(initialData))

      // Listen for message events
      const onMessage = (message: {
        id: string
        content: string
        teamId: string
        authorId: string
        createdAt: Date
      }) => {
        if (message.teamId === teamId) {
          const data = `data: ${JSON.stringify({ type: 'message', data: message })}\n\n`
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            // Stream may be closed
            console.error('Error sending SSE message:', error)
          }
        }
      }

      serverEvents.on('message:created', onMessage)

      // Send keepalive ping every 30 seconds
      const keepaliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepaliveInterval)
        }
      }, 30000)

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        serverEvents.off('message:created', onMessage)
        clearInterval(keepaliveInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  })
}
