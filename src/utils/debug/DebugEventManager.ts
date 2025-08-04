/**
 * Debug Event Manager
 * Handles event capture and logging for debug overlay
 */

export interface DebugEvent {
  timestamp: Date;
  type: string;
  data: any;
  source: string;
}

export class DebugEventManager {
  private eventLog: DebugEvent[] = [];
  private maxEvents = 100;

  constructor() {
    this.initializeEventCapture();
  }

  private initializeEventCapture(): void {
    // Capture custom events
    const events = [
      'next:cart-updated',
      'next:checkout-step', 
      'next:item-added',
      'next:item-removed',
      'next:timer-expired',
      'next:validation-error',
      'next:payment-success',
      'next:payment-error'
    ];

    events.forEach(eventType => {
      document.addEventListener(eventType, (e) => {
        this.logEvent(eventType.replace('next:', ''), (e as CustomEvent).detail, 'CustomEvent');
      });
    });

    // Capture API calls
    this.interceptFetch();
  }

  private interceptFetch(): void {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0].toString();
      if (url.includes('29next.com') || url.includes('campaigns.')) {
        this.logEvent('api-request', { 
          url, 
          method: args[1]?.method || 'GET' 
        }, 'API');
      }
      return originalFetch.apply(window, args);
    };
  }

  public logEvent(type: string, data: any, source: string): void {
    this.eventLog.push({
      timestamp: new Date(),
      type,
      data,
      source
    });

    // Keep only last N events
    if (this.eventLog.length > this.maxEvents) {
      this.eventLog.shift();
    }
  }

  public getEvents(limit?: number): DebugEvent[] {
    const events = limit ? this.eventLog.slice(-limit) : this.eventLog;
    return events.reverse(); // Most recent first
  }

  public clearEvents(): void {
    this.eventLog = [];
  }

  public exportEvents(): string {
    return JSON.stringify(this.eventLog, null, 2);
  }
}