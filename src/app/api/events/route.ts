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

      // Listen for task update events
      const onTaskUpdated = (eventData: { taskId: string; teamId: string }) => {
        if (eventData.teamId === teamId) {
          const data = `data: ${JSON.stringify({ type: 'task:updated', data: eventData })}\n\n`
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error sending SSE task update:', error)
          }
        }
      }

      // Listen for task created events
      const onTaskCreated = (eventData: { taskId: string; teamId: string }) => {
        if (eventData.teamId === teamId) {
          const data = `data: ${JSON.stringify({ type: 'task:created', data: eventData })}\n\n`
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error sending SSE task created:', error)
          }
        }
      }

      // Listen for task deleted events
      const onTaskDeleted = (eventData: { taskId: string; teamId: string }) => {
        if (eventData.teamId === teamId) {
          const data = `data: ${JSON.stringify({ type: 'task:deleted', data: eventData })}\n\n`
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error sending SSE task deleted:', error)
          }
        }
      }

      // Listen for task reordered events
      const onTaskReordered = (eventData: { teamId: string }) => {
        if (eventData.teamId === teamId) {
          const data = `data: ${JSON.stringify({ type: 'task:reordered', data: eventData })}\n\n`
          try {
            controller.enqueue(encoder.encode(data))
          } catch (error) {
            console.error('Error sending SSE task reordered:', error)
          }
        }
      }

      serverEvents.on('message:created', onMessage)
      serverEvents.on('task:updated', onTaskUpdated)
      serverEvents.on('task:created', onTaskCreated)
      serverEvents.on('task:deleted', onTaskDeleted)
      serverEvents.on('task:reordered', onTaskReordered)

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
        serverEvents.off('task:updated', onTaskUpdated)
        serverEvents.off('task:created', onTaskCreated)
        serverEvents.off('task:deleted', onTaskDeleted)
        serverEvents.off('task:reordered', onTaskReordered)
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
