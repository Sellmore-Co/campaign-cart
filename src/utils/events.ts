/**
 * Type-safe event bus for SDK communication
 */

import type { EventMap } from '@/types/global';

export class EventBus {
  private static instance: EventBus;
  private listeners = new Map<keyof EventMap, Set<Function>>();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as (data: EventMap[K]) => void)(data);
        } catch (error) {
          console.error(`Event handler error for ${String(event)}:`, error);
        }
      });
    }
  }

  public off<K extends keyof EventMap>(event: K, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}