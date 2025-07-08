/**
 * Pending Events Handler for Analyticsv v0.2.0
 * 
 * Manages analytics events that need to be fired after page redirects.
 * This is crucial for purchase events that happen right before redirects.
 */

import { createLogger } from '../../logger';
import { dataLayer } from '../DataLayerManager';
import type { DataLayerEvent } from '../types';

const logger = createLogger('PendingEventsHandler');
const STORAGE_KEY = 'next_pending_events';

export interface PendingNextEvent {
  event: DataLayerEvent;
  timestamp: number;
  id: string;
}

export class PendingEventsHandler {
  private static instance: PendingEventsHandler;
  
  private constructor() {}

  public static getInstance(): PendingEventsHandler {
    if (!PendingEventsHandler.instance) {
      PendingEventsHandler.instance = new PendingEventsHandler();
    }
    return PendingEventsHandler.instance;
  }

  /**
   * Queue an event to be fired after redirect
   */
  public queueEvent(event: DataLayerEvent): void {
    try {
      const pending = this.getPendingEvents();
      const pendingEvent: PendingNextEvent = {
        event,
        timestamp: Date.now(),
        id: `${event.event}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      pending.push(pendingEvent);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
      
      logger.info(`Event queued for after redirect: ${event.event} (${pending.length} total queued)`);
    } catch (error) {
      logger.error('Failed to queue event:', error);
    }
  }

  /**
   * Get all pending events
   */
  private getPendingEvents(): PendingNextEvent[] {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const events = JSON.parse(data);
      return Array.isArray(events) ? events : [];
    } catch (error) {
      logger.error('Failed to get pending events:', error);
      return [];
    }
  }

  /**
   * Process and fire all pending events
   */
  public processPendingEvents(): void {
    const events = this.getPendingEvents();
    
    if (events.length === 0) {
      logger.debug('No pending analytics events to process');
      return;
    }
    
    logger.info(`Processing ${events.length} pending analytics events`);
    
    const processedIds: string[] = [];
    
    for (const pendingEvent of events) {
      try {
        // Skip events older than 5 minutes
        if (Date.now() - pendingEvent.timestamp > 5 * 60 * 1000) {
          logger.warn('Skipping stale event:', pendingEvent.event.event);
          processedIds.push(pendingEvent.id);
          continue;
        }
        
        // Push event to data layer
        dataLayer.push(pendingEvent.event);
        processedIds.push(pendingEvent.id);
        
        logger.debug('Processed pending event:', pendingEvent.event.event);
      } catch (error) {
        logger.error('Failed to process pending event:', pendingEvent.event.event, error);
      }
    }
    
    // Remove processed events
    if (processedIds.length > 0) {
      const remaining = events.filter(e => !processedIds.includes(e.id));
      
      if (remaining.length === 0) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      }
      
      logger.debug('Removed processed events:', processedIds.length);
    }
  }

  /**
   * Clear all pending events
   */
  public clearPendingEvents(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      logger.debug('Cleared all pending events');
    } catch (error) {
      logger.error('Failed to clear pending events:', error);
    }
  }

  /**
   * Reset the handler (called by NextAnalytics)
   */
  public reset(): void {
    this.clearPendingEvents();
    logger.debug('PendingEventsHandler reset');
  }

  /**
   * Initialize the handler (called by NextAnalytics)
   */
  public initialize(): void {
    // Nothing to initialize, but method is required for consistency
    logger.debug('PendingEventsHandler initialized');
  }

}

// Export singleton instance
export const pendingEventsHandler = PendingEventsHandler.getInstance();