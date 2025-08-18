/**
 * Event Timeline Panel - Advanced debugging for events and dataLayer
 * 
 * Provides real-time monitoring of:
 * - GTM dataLayer events
 * - Internal SDK events
 * - DOM CustomEvents
 * - Performance timeline
 */

import { DebugPanel } from '../DebugPanels';
import { EventBus } from '../../events';

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'dataLayer' | 'internal' | 'dom' | 'performance';
  name: string;
  data: any;
  source: string;
  duration?: number;
  relativeTime: string;
}

interface EventFilter {
  types: Set<string>;
  sources: Set<string>;
  search: string;
  timeRange: number; // minutes
}

export class EventTimelinePanel implements DebugPanel {
  id = 'event-timeline';
  title = 'Events';
  icon = '⚡';

  private events: TimelineEvent[] = [];
  private maxEvents = 1000;
  private isRecording = true;
  private filters: EventFilter = {
    types: new Set(['dataLayer', 'internal', 'dom']),
    sources: new Set(),
    search: '',
    timeRange: 30 // last 30 minutes
  };

  private startTime = Date.now();
  private eventBus = EventBus.getInstance();

  constructor() {
    this.initializeEventWatching();
  }

  private initializeEventWatching(): void {
    this.watchDataLayer();
    this.watchInternalEvents();
    this.watchDOMEvents();
    this.watchPerformanceEvents();
  }

  private watchDataLayer(): void {
    if (typeof window === 'undefined') return;

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Store original push method
    const originalPush = window.dataLayer.push;

    // Override push to capture events
    window.dataLayer.push = (...args: any[]) => {
      if (this.isRecording) {
        args.forEach(event => {
          // Determine source based on event content
          let source = 'GTM DataLayer';
          if (event.event && event.event.startsWith('gtm_')) {
            source = 'GTM Internal';
          } else if (event.timestamp || event.event_context) {
            source = 'Analytics Manager';
          }

          this.addEvent({
            type: 'dataLayer',
            name: event.event || 'dataLayer.push',
            data: event,
            source
          });
        });
      }
      return originalPush.apply(window.dataLayer, args);
    };

    // Watch for existing events
    if (window.dataLayer.length > 0) {
      window.dataLayer.forEach((event, index) => {
        if (typeof event === 'object' && event.event) {
          this.addEvent({
            type: 'dataLayer',
            name: event.event,
            data: event,
            source: 'GTM DataLayer (existing)',
            timestamp: this.startTime + index * 10 // Approximate timing
          });
        }
      });
    }
  }

  private watchInternalEvents(): void {
    // Monitor all internal SDK events
    const internalEvents = [
      'cart:updated', 'cart:item-added', 'cart:item-removed', 'cart:quantity-changed',
      'campaign:loaded', 'checkout:started', 'checkout:form-initialized',
      'order:completed', 'payment:tokenized', 'payment:error',
      'coupon:applied', 'coupon:removed', 'upsell:added', 'upsell:skipped',
      'config:updated', 'error:occurred'
    ];

    internalEvents.forEach(eventName => {
      this.eventBus.on(eventName as any, (data) => {
        if (this.isRecording) {
          this.addEvent({
            type: 'internal',
            name: eventName,
            data: data,
            source: 'SDK Internal'
          });
        }
      });
    });
  }

  private watchDOMEvents(): void {
    if (typeof document === 'undefined') return;

    const domEvents = [
      'next:initialized', 'next:cart-updated', 'next:item-added', 'next:item-removed',
      'next:checkout-started', 'next:payment-success', 'next:payment-error',
      'next:timer-expired', 'next:coupon-applied', 'next:display-ready'
    ];

    domEvents.forEach(eventName => {
      document.addEventListener(eventName, (event: Event) => {
        if (this.isRecording) {
          const customEvent = event as CustomEvent;
          this.addEvent({
            type: 'dom',
            name: eventName,
            data: customEvent.detail,
            source: 'DOM CustomEvent'
          });
        }
      });
    });
  }

  private watchPerformanceEvents(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    // Monitor performance marks and measures
    const originalMark = performance.mark;
    const originalMeasure = performance.measure;
    const self = this;

    performance.mark = function(name: string) {
      const result = originalMark.call(performance, name);
      if (self.isRecording) {
        self.addEvent({
          type: 'performance',
          name: `mark: ${name}`,
          data: { markName: name, timestamp: performance.now() },
          source: 'Performance API'
        });
      }
      return result;
    };

    performance.measure = function(name: string, startMark?: string, endMark?: string) {
      const result = originalMeasure.call(performance, name, startMark, endMark);
      if (self.isRecording) {
        self.addEvent({
          type: 'performance',
          name: `measure: ${name}`,
          data: { measureName: name, startMark, endMark },
          source: 'Performance API'
        });
      }
      return result;
    };
  }

  private addEvent(eventData: Partial<TimelineEvent>): void {
    const now = Date.now();
    const event: TimelineEvent = {
      id: `event_${now}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: eventData.timestamp || now,
      type: eventData.type || 'internal',
      name: eventData.name || 'unknown',
      data: eventData.data || {},
      source: eventData.source || 'Unknown',
      relativeTime: this.formatRelativeTime(eventData.timestamp || now)
    };

    this.events.unshift(event); // Add to beginning for chronological order

    // Limit event history
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Update filter options safely
    if (event.source && event.source !== 'Unknown') {
      this.filters.sources.add(event.source);
    }

    // Trigger content update only if this panel is active and user isn't interacting with inputs
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      const isUserTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT');
      
      if (!isUserTyping) {
        // Only update if no form interaction is happening
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('debug:update-content'));
        }, 100);
      }
    }
  }

  private formatRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return 'just now';
  }

  private getFilteredEvents(): TimelineEvent[] {
    const cutoffTime = Date.now() - (this.filters.timeRange * 60 * 1000);
    
    return this.events.filter(event => {
      // Time range filter
      if (event.timestamp < cutoffTime) return false;
      
      // Type filter
      if (!this.filters.types.has(event.type)) return false;
      
      // Source filter (if any sources selected)
      if (this.filters.sources.size > 0 && !this.filters.sources.has(event.source)) return false;
      
      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        return (
          event.name.toLowerCase().includes(searchLower) ||
          event.source.toLowerCase().includes(searchLower) ||
          JSON.stringify(event.data).toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }

  // getEventIcon method removed - unused

  private getEventTypeColor(type: string): string {
    const colors = {
      dataLayer: '#4CAF50',    // Green
      internal: '#2196F3',     // Blue  
      dom: '#FF9800',          // Orange
      performance: '#9C27B0'   // Purple
    };
    return colors[type as keyof typeof colors] || '#666';
  }


  getTabs() {
    return [
      {
        id: 'timeline',
        label: 'Events',
        icon: '📅',
        getContent: () => this.getTimelineContent()
      },
      {
        id: 'analytics',
        label: 'Stats', 
        icon: '📊',
        getContent: () => this.getAnalyticsContent()
      },
      {
        id: 'filters',
        label: 'Filter',
        icon: '🔍',
        getContent: () => this.getFiltersContent()
      }
    ];
  }

  private getTimelineContent(): string {
    const filteredEvents = this.getFilteredEvents();

    if (filteredEvents.length === 0) {
      return `<div style="padding: 20px; text-align: center; color: #666;">No events yet</div>`;
    }

    let eventsHtml = '';
    filteredEvents.slice(0, 20).forEach(event => {
      eventsHtml += `
        <div style="border-bottom: 1px solid #333; padding: 8px; background: #1a1a1a;">
          <div style="font-weight: bold; color: ${this.getEventTypeColor(event.type)};">
            ${event.name} <span style="float: right; font-weight: normal; color: #999;">${event.relativeTime}</span>
          </div>
          <div style="color: #999; font-size: 11px; margin: 4px 0;">${event.source}</div>
          <div style="background: #2a2a2a; padding: 4px; border-radius: 3px; font-family: monospace; font-size: 10px; overflow: hidden; color: #ccc;">
            ${JSON.stringify(event.data).length > 100 ? JSON.stringify(event.data).substring(0, 100) + '...' : JSON.stringify(event.data)}
          </div>
        </div>
      `;
    });

    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <div style="position: sticky; top: 0; padding: 12px 24px; background: #2a2a2a; border-bottom: 1px solid #444; z-index: 1;">
          <strong style="color: #fff;">Total Events: ${this.events.length}</strong>
          <span style="float: right; color: #888; font-size: 12px;">
            ${this.isRecording ? '🔴 Recording' : '⏸️ Paused'}
          </span>
        </div>
        <div style="flex: 1; background: #1a1a1a;">
          ${eventsHtml}
        </div>
      </div>
    `;
  }

  private getAnalyticsContent(): string {
    const stats = this.getEventStats();
    const typeDistribution = this.getTypeDistribution();

    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Event Statistics</h4>
        <p>Total Events: <strong>${stats.total}</strong></p>
        <p>Events Per Minute: <strong>${stats.eventsPerMinute}</strong></p>
        <p>Most Active Type: <strong>${stats.mostActiveType}</strong></p>
        
        <h4 style="margin-top: 20px; color: #fff;">Event Types</h4>
        ${Object.entries(typeDistribution).map(([type, count]) => `
          <p style="margin: 5px 0;">
            <span style="color: ${this.getEventTypeColor(type)};">${type}:</span> 
            <strong>${count}</strong>
          </p>
        `).join('')}
      </div>
    `;
  }

  private getFiltersContent(): string {
    const availableTypes = ['dataLayer', 'internal', 'dom', 'performance'];

    return `
      <div style="padding: 15px; background: #1a1a1a; color: #fff;">
        <h4 style="color: #fff;">Search Events</h4>
        <input type="text" 
               placeholder="Search event names or data..." 
               value="${this.filters.search || ''}"
               style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
        
        <h4 style="color: #fff;">Event Types</h4>
        ${availableTypes.map(type => `
          <label style="display: block; margin: 8px 0; color: #fff;">
            <input type="checkbox" ${this.filters.types.has(type) ? 'checked' : ''} style="margin-right: 8px;">
            ${type}
          </label>
        `).join('')}
        
        <h4 style="margin-top: 20px; color: #fff;">Time Range</h4>
        <select style="width: 100%; padding: 8px; border: 1px solid #666; border-radius: 4px; background: #2a2a2a; color: #fff;">
          <option value="5">Last 5 minutes</option>
          <option value="15">Last 15 minutes</option>
          <option value="30" selected>Last 30 minutes</option>
          <option value="60">Last hour</option>
        </select>
      </div>
    `;
  }

  private getEventStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentEvents = this.events.filter(e => e?.timestamp && e.timestamp > oneMinuteAgo);
    
    const typeCounts = this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const mostActiveType = Object.entries(typeCounts)
      .sort(([,a], [,b]) => (b || 0) - (a || 0))[0]?.[0];

    return {
      total: this.events.length,
      eventsPerMinute: recentEvents.length,
      mostActiveType: mostActiveType || 'None'
    };
  }

  private getTypeDistribution(): Record<string, number> {
    return this.events.reduce((acc, event) => {
      if (event?.type) {
        acc[event.type] = (acc[event.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private getSourceDistribution(): Record<string, number> {
    return this.events.reduce((acc, event) => {
      if (event?.source) {
        acc[event.source] = (acc[event.source] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  // getTimelineChart method removed - unused

  public getActions() {
    return [
      {
        label: this.isRecording ? '⏸️ Pause Recording' : '▶️ Start Recording',
        action: () => {
          this.isRecording = !this.isRecording;
          console.log(`Event recording ${this.isRecording ? 'started' : 'paused'}`);
        }
      },
      {
        label: '🗑️ Clear Events',
        action: () => {
          this.events = [];
          console.log('Event timeline cleared');
        }
      },
      {
        label: '💾 Export Events',
        action: () => this.exportEvents()
      },
      {
        label: '🧪 Test Events',
        action: () => this.generateTestEvents()
      }
    ];
  }

  private exportEvents(): void {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalEvents: this.events.length,
      filters: {
        types: Array.from(this.filters.types),
        sources: Array.from(this.filters.sources),
        search: this.filters.search,
        timeRange: this.filters.timeRange
      },
      events: this.events,
      stats: this.getEventStats(),
      typeDistribution: this.getTypeDistribution(),
      sourceDistribution: this.getSourceDistribution()
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-timeline-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private generateTestEvents(): void {
    // Generate test events for demonstration
    const testEvents: Partial<TimelineEvent>[] = [
      { type: 'dataLayer', name: 'add_to_cart', data: { item_id: '123', value: 29.99 }, source: 'Test' },
      { type: 'internal', name: 'cart:updated', data: { itemCount: 2 }, source: 'Test' },
      { type: 'dom', name: 'next:item-added', data: { packageId: 123 }, source: 'Test' },
      { type: 'performance', name: 'navigation', data: { loadTime: 1234 }, source: 'Test' }
    ];

    testEvents.forEach((event, index) => {
      setTimeout(() => {
        this.addEvent(event);
      }, index * 200);
    });

    console.log('Generated test events for timeline');
  }

  public getContent(): string {
    return this.getTimelineContent();
  }
}