import type { Message } from '@prisma/client'
import { EventEmitter } from 'events'

// Event types for type-safe event emitter
export interface ServerEvents {
  'message:created': (message: Message) => void
  'task:updated': (taskId: string) => void
}

// Type-safe event emitter
class TypedEventEmitter extends EventEmitter {
  on<K extends keyof ServerEvents>(event: K, listener: ServerEvents[K]): this {
    return super.on(event, listener)
  }

  emit<K extends keyof ServerEvents>(
    event: K,
    ...args: Parameters<ServerEvents[K]>
  ): boolean {
    return super.emit(event, ...args)
  }

  off<K extends keyof ServerEvents>(event: K, listener: ServerEvents[K]): this {
    return super.off(event, listener)
  }
}

// Singleton event emitter for the server
export const serverEvents = new TypedEventEmitter()
