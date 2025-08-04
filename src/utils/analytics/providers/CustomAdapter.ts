import { ProviderAdapter } from './ProviderAdapter';
import { DataLayerEvent } from '../types';

interface CustomAdapterConfig {
  endpoint?: string;
  headers?: Record<string, string>;
  batchSize?: number;
  batchIntervalMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  transformFunction?: (event: DataLayerEvent) => any;
}

/**
 * Custom adapter for sending events to webhooks or custom APIs
 */
export class CustomAdapter extends ProviderAdapter {
  private config: Required<CustomAdapterConfig>;
  private eventQueue: DataLayerEvent[] = [];
  private batchTimer: number | null = null;
  private retryQueue: Map<string, { event: DataLayerEvent; attempts: number }> = new Map();

  constructor(config: CustomAdapterConfig = {}) {
    super('Custom');
    
    // Set default configuration
    this.config = {
      endpoint: config.endpoint || '',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      batchSize: config.batchSize || 10,
      batchIntervalMs: config.batchIntervalMs || 5000,
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 1000,
      transformFunction: config.transformFunction || ((event) => event)
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CustomAdapterConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update headers separately to merge them
    if (config.headers) {
      this.config.headers = { ...this.config.headers, ...config.headers };
    }
  }

  /**
   * Send event to custom endpoint
   */
  sendEvent(event: DataLayerEvent): void {
    if (!this.enabled || !this.config.endpoint) {
      this.debug('Custom adapter disabled or no endpoint configured');
      return;
    }

    // Add event to queue
    this.eventQueue.push(event);
    this.debug(`Event queued. Queue size: ${this.eventQueue.length}`);

    // Check if we should send batch immediately
    if (this.eventQueue.length >= this.config.batchSize) {
      this.sendBatch();
    } else {
      // Schedule batch send if not already scheduled
      this.scheduleBatch();
    }
  }

  /**
   * Schedule batch sending
   */
  private scheduleBatch(): void {
    if (this.batchTimer) {
      return; // Already scheduled
    }

    this.batchTimer = setTimeout(() => {
      this.sendBatch();
    }, this.config.batchIntervalMs) as unknown as number;
  }

  /**
   * Send batch of events
   */
  private async sendBatch(): Promise<void> {
    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer as unknown as NodeJS.Timeout);
      this.batchTimer = null;
    }

    // Get events to send
    const eventsToSend = this.eventQueue.splice(0, this.config.batchSize);
    
    if (eventsToSend.length === 0) {
      return;
    }

    this.debug(`Sending batch of ${eventsToSend.length} events`);

    try {
      // Transform events
      const transformedEvents = eventsToSend.map(event => 
        this.config.transformFunction(event)
      );

      // Prepare request body
      const body = {
        events: transformedEvents,
        batch_info: {
          size: transformedEvents.length,
          timestamp: new Date().toISOString(),
          source: 'next-campaign-cart'
        }
      };

      // Send request
      const response = await this.sendRequest(body);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.debug(`Batch sent successfully`);
    } catch (error) {
      console.error('Error sending batch to custom endpoint:', error);
      
      // Add events to retry queue
      eventsToSend.forEach(event => {
        this.addToRetryQueue(event);
      });
    }

    // Schedule next batch if there are more events
    if (this.eventQueue.length > 0) {
      this.scheduleBatch();
    }
  }

  /**
   * Send HTTP request with retry logic
   */
  private async sendRequest(body: any, attempt: number = 1): Promise<Response> {
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: this.config.headers,
        body: JSON.stringify(body)
      });

      return response;
    } catch (error) {
      if (attempt < this.config.maxRetries) {
        // Wait before retrying
        await this.delay(this.config.retryDelayMs * attempt);
        return this.sendRequest(body, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Add event to retry queue
   */
  private addToRetryQueue(event: DataLayerEvent): void {
    const retryInfo = event.id ? this.retryQueue.get(event.id) : undefined;
    
    if (!retryInfo) {
      if (event.id) {
        this.retryQueue.set(event.id, { event, attempts: 1 });
        this.scheduleRetry(event.id);
      }
    } else if (retryInfo.attempts < this.config.maxRetries) {
      retryInfo.attempts++;
      if (event.id) {
        this.scheduleRetry(event.id);
      }
    } else {
      // Max retries reached, remove from queue
      if (event.id) {
        this.retryQueue.delete(event.id);
      }
      console.error(`Failed to send event after ${this.config.maxRetries} attempts:`, event);
    }
  }

  /**
   * Schedule retry for a specific event
   */
  private scheduleRetry(eventId: string): void {
    const retryInfo = this.retryQueue.get(eventId);
    if (!retryInfo) return;

    const delay = this.config.retryDelayMs * retryInfo.attempts;
    
    setTimeout(() => {
      const info = this.retryQueue.get(eventId);
      if (info) {
        this.retryQueue.delete(eventId);
        this.sendEvent(info.event);
      }
    }, delay);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Force send all queued events immediately
   */
  async flush(): Promise<void> {
    this.debug('Flushing all queued events');
    
    // Cancel scheduled batch
    if (this.batchTimer) {
      clearTimeout(this.batchTimer as unknown as NodeJS.Timeout);
      this.batchTimer = null;
    }

    // Send all events in batches
    while (this.eventQueue.length > 0) {
      await this.sendBatch();
    }
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Get retry queue size
   */
  getRetryQueueSize(): number {
    return this.retryQueue.size;
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue = [];
    this.retryQueue.clear();
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer as unknown as NodeJS.Timeout);
      this.batchTimer = null;
    }
  }
}