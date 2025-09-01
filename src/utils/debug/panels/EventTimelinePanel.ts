/**
 * Event Timeline Panel - Advanced debugging for events and dataLayer
 * 
 * Provides real-time monitoring of:
 * - GTM dataLayer events
 * - Internal SDK events
 * - DOM CustomEvents
 * - Performance timeline
 */

import { DebugPanel, PanelAction } from '../DebugPanels';
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
  isInternal?: boolean;
}

// Map internal events from global.ts EventMap
const INTERNAL_EVENT_PATTERNS = [
  'cart:updated',
  'cart:item-added', 
  'cart:item-removed',
  'cart:quantity-changed',
  'campaign:loaded',
  'checkout:started',
  'checkout:form-initialized',
  'checkout:spreedly-ready',
  'checkout:express-started',
  'order:completed',
  'order:redirect-missing',
  'error:occurred',
  'timer:expired',
  'config:updated',
  'coupon:applied',
  'coupon:removed',
  'coupon:validation-failed',
  'selector:item-selected',
  'selector:action-completed',
  'selector:selection-changed',
  'shipping:method-selected',
  'shipping:method-changed',
  'action:success',
  'action:failed',
  'upsell:accepted',
  'upsell-selector:item-selected',
  'upsell:quantity-changed',
  'upsell:option-selected',
  'message:displayed',
  'payment:tokenized',
  'payment:error',
  'checkout:express-completed',
  'checkout:express-failed',
  'express-checkout:initialized',
  'express-checkout:error',
  'express-checkout:started',
  'express-checkout:failed',
  'express-checkout:completed',
  'express-checkout:redirect-missing',
  'address:autocomplete-filled',
  'address:location-fields-shown',
  'checkout:location-fields-shown',
  'checkout:billing-location-fields-shown',
  'upsell:initialized',
  'upsell:adding',
  'upsell:added',
  'upsell:error',
  'accordion:toggled',
  'accordion:opened',
  'accordion:closed',
  'upsell:skipped',
  'upsell:viewed',
  'exit-intent:shown',
  'exit-intent:clicked',
  'exit-intent:dismissed',
  'exit-intent:closed',
  'exit-intent:action',
  'fomo:shown'
];

export class EventTimelinePanel implements DebugPanel {
  id = 'event-timeline';
  title = 'Events';
  icon = '⚡';

  private events: TimelineEvent[] = [];
  private maxEvents = 1000;
  private isRecording = true;
  private showInternalEvents = false;
  private updateTimeout: NodeJS.Timeout | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;

  private startTime = Date.now();
  private eventBus = EventBus.getInstance();
  
  // Storage keys
  private static readonly EVENTS_STORAGE_KEY = 'debug-events-history';
  private static readonly SHOW_INTERNAL_KEY = 'debug-events-show-internal';
  private static readonly MAX_STORED_EVENTS = 500;

  constructor() {
    this.loadSavedState();
    this.initializeEventWatching();
    EventTimelinePanel.instance = this;
  }

  private loadSavedState(): void {
    // Load show internal events preference
    const savedShowInternal = localStorage.getItem(EventTimelinePanel.SHOW_INTERNAL_KEY);
    if (savedShowInternal !== null) {
      this.showInternalEvents = savedShowInternal === 'true';
    }
    
    // Load saved events
    try {
      const savedEvents = localStorage.getItem(EventTimelinePanel.EVENTS_STORAGE_KEY);
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (Array.isArray(parsed)) {
          this.events = parsed.map(event => ({
            ...event,
            relativeTime: this.formatRelativeTime(event.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load saved events:', error);
    }
  }
  
  private saveEvents(): void {
    // Debounce saves to avoid too many localStorage writes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        // Only save the most recent events to avoid localStorage limits
        const eventsToSave = this.events.slice(0, EventTimelinePanel.MAX_STORED_EVENTS);
        localStorage.setItem(EventTimelinePanel.EVENTS_STORAGE_KEY, JSON.stringify(eventsToSave));
      } catch (error) {
        console.error('Failed to save events:', error);
      }
    }, 500); // Debounce for 500ms
  }
  
  public toggleInternalEvents(): void {
    this.showInternalEvents = !this.showInternalEvents;
    localStorage.setItem(EventTimelinePanel.SHOW_INTERNAL_KEY, String(this.showInternalEvents));
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
          let isInternal = false;
          
          if (event.event && event.event.startsWith('gtm_')) {
            source = 'GTM Internal';
            isInternal = true;
          } else if (event.timestamp || event.event_context) {
            source = 'Analytics Manager';
          }

          // Check if it's an internal SDK event
          if (event.event && INTERNAL_EVENT_PATTERNS.includes(event.event)) {
            isInternal = true;
          }

          this.addEvent({
            type: 'dataLayer',
            name: event.event || 'dataLayer.push',
            data: event,
            source,
            isInternal
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
            source: 'GTM DataLayer (Historical)',
            isInternal: INTERNAL_EVENT_PATTERNS.includes(event.event)
          });
        }
      });
    }
  }

  private watchInternalEvents(): void {
    // Subscribe to all EventBus events
    const eventHandler = (eventName: string, data: any) => {
      if (this.isRecording) {
        this.addEvent({
          type: 'internal',
          name: eventName,
          data: data,
          source: 'SDK EventBus',
          isInternal: true
        });
      }
    };

    // Hook into EventBus emit method
    const originalEmit = this.eventBus.emit.bind(this.eventBus);
    (this.eventBus as any).emit = (event: string, data?: any) => {
      eventHandler(event, data);
      return originalEmit(event, data);
    };
  }

  private watchDOMEvents(): void {
    if (typeof window === 'undefined') return;

    const eventsToWatch = [
      'click', 'submit', 'change', 'focus', 'blur',
      'scroll', 'resize', 'load', 'error'
    ];
    
    // Events to ignore (debug panel internal events)
    const eventsToIgnore = [
      'debug:event-added',
      'debug:update-content',
      'debug:panel-switched'
    ];

    // Override dispatchEvent for CustomEvents
    const originalDispatch = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function(event: Event) {
      if (event instanceof CustomEvent && 
          !eventsToWatch.includes(event.type) && 
          !eventsToIgnore.includes(event.type) &&
          !event.type.startsWith('debug:')) {
        const self = EventTimelinePanel.getInstance();
        if (self && self.isRecording) {
          self.addEvent({
            type: 'dom',
            name: event.type,
            data: event.detail || {},
            source: 'DOM CustomEvent',
            isInternal: INTERNAL_EVENT_PATTERNS.includes(event.type)
          });
        }
      }
      return originalDispatch.call(this, event);
    };
  }

  private static instance: EventTimelinePanel | null = null;
  
  private static getInstance(): EventTimelinePanel | null {
    return EventTimelinePanel.instance;
  }

  private watchPerformanceEvents(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    const self = this;
    
    // Watch performance marks
    const originalMark = performance.mark;
    performance.mark = function(name: string) {
      const result = originalMark.call(performance, name);
      if (self.isRecording) {
        self.addEvent({
          type: 'performance',
          name: `mark: ${name}`,
          data: { markName: name },
          source: 'Performance API',
          isInternal: true
        });
      }
      return result;
    };

    // Watch performance measures
    const originalMeasure = performance.measure;
    performance.measure = function(name: string, startMark?: string, endMark?: string) {
      const result = originalMeasure.call(performance, name, startMark, endMark);
      if (self.isRecording) {
        self.addEvent({
          type: 'performance',
          name: `measure: ${name}`,
          data: { measureName: name, startMark, endMark },
          source: 'Performance API',
          isInternal: true
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
      relativeTime: this.formatRelativeTime(eventData.timestamp || now),
      isInternal: eventData.isInternal || false
    };

    this.events.unshift(event); // Add to beginning for chronological order

    // Limit event history
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // Save events to localStorage
    this.saveEvents();

    // Trigger content update for real-time updates
    if (typeof document !== 'undefined') {
      // Debounce updates to avoid too frequent re-renders
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      
      this.updateTimeout = setTimeout(() => {
        // Dispatch event to update content
        document.dispatchEvent(new CustomEvent('debug:event-added', { 
          detail: { 
            panelId: this.id,
            event: event 
          } 
        }));
      }, 100); // Small delay to batch rapid events
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

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  private getFilteredEvents(): TimelineEvent[] {
    if (this.showInternalEvents) {
      return this.events;
    }
    return this.events.filter(event => !event.isInternal);
  }

  private getEventTypeColor(type: string): string {
    const colors = {
      dataLayer: '#4CAF50',
      internal: '#2196F3', 
      dom: '#FF9800',
      performance: '#9C27B0'
    };
    return colors[type as keyof typeof colors] || '#666';
  }

  private getEventTypeBadge(type: string): string {
    const badges = {
      dataLayer: 'GTM',
      internal: 'SDK', 
      dom: 'DOM',
      performance: 'PERF'
    };
    return badges[type as keyof typeof badges] || type.toUpperCase();
  }

  getContent(): string {
    const filteredEvents = this.getFilteredEvents();

    return `
      <style>
        .events-table-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #0f0f0f;
        }
        .events-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .events-stats {
          display: flex;
          gap: 20px;
          align-items: center;
        }
        .event-stat {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .event-stat-value {
          font-weight: 600;
          color: #3C7DFF;
        }
        .event-stat-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9em;
        }
        .events-controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .toggle-internal {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .toggle-internal:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .toggle-internal.active {
          background: rgba(60, 125, 255, 0.2);
          border-color: #3C7DFF;
        }
        .recording-status {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: ${this.isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
          border: 1px solid ${this.isRecording ? '#EF4444' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 6px;
          color: ${this.isRecording ? '#EF4444' : 'rgba(255, 255, 255, 0.6)'};
        }
        .recording-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          ${this.isRecording ? 'animation: pulse 1.5s infinite;' : ''}
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .events-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9em;
        }
        .events-table th {
          background: rgba(255, 255, 255, 0.05);
          padding: 10px;
          text-align: left;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .events-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.7);
        }
        .events-table tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        .event-type-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75em;
          font-weight: 600;
          text-transform: uppercase;
        }
        .event-name {
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }
        .event-source {
          font-size: 0.85em;
          color: rgba(255, 255, 255, 0.5);
        }
        .event-time {
          font-family: 'SF Mono', monospace;
          font-size: 0.85em;
          color: rgba(255, 255, 255, 0.5);
        }
        .event-data {
          max-width: 400px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: 'SF Mono', monospace;
          font-size: 0.85em;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }
        .event-data:hover {
          color: rgba(255, 255, 255, 0.8);
        }
        .event-data-expanded {
          white-space: pre-wrap;
          word-break: break-all;
          max-width: none;
          background: rgba(255, 255, 255, 0.02);
          padding: 8px;
          border-radius: 4px;
          margin-top: 4px;
        }
        .internal-badge {
          display: inline-block;
          padding: 1px 6px;
          background: rgba(156, 39, 176, 0.2);
          color: #9C27B0;
          border-radius: 3px;
          font-size: 0.7em;
          font-weight: 600;
          margin-left: 6px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: rgba(255, 255, 255, 0.4);
        }
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .empty-state-text {
          font-size: 1.1em;
        }
      </style>
      
      <div class="events-table-container">
        <div class="events-header">
          <div class="events-stats">
            <div class="event-stat">
              <span class="event-stat-value">${this.events.length}</span>
              <span class="event-stat-label">Total Events</span>
            </div>
            <div class="event-stat">
              <span class="event-stat-value">${filteredEvents.length}</span>
              <span class="event-stat-label">Visible</span>
            </div>
          </div>
          
          <div class="events-controls">
            <button class="toggle-internal ${this.showInternalEvents ? 'active' : ''}" 
                    data-action="toggle-internal-events">
              <span>${this.showInternalEvents ? '✓' : ''}</span>
              Show Internal Events
            </button>
            
            <div class="recording-status">
              <span class="recording-dot"></span>
              <span>${this.isRecording ? 'Recording' : 'Paused'}</span>
            </div>
          </div>
        </div>
        
        ${filteredEvents.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-text">No events captured yet</div>
          </div>
        ` : `
          <div style="flex: 1; overflow-y: auto;">
            <table class="events-table">
              <thead>
                <tr>
                  <th style="width: 5%">#</th>
                  <th style="width: 8%">Type</th>
                  <th style="width: 25%">Event Name</th>
                  <th style="width: 15%">Source</th>
                  <th style="width: 12%">Time</th>
                  <th style="width: 35%">Data</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEvents.slice(0, 100).map((event, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>
                      <span class="event-type-badge" style="background: ${this.getEventTypeColor(event.type)}22; color: ${this.getEventTypeColor(event.type)};">
                        ${this.getEventTypeBadge(event.type)}
                      </span>
                    </td>
                    <td>
                      <span class="event-name">${event.name}</span>
                      ${event.isInternal ? '<span class="internal-badge">INTERNAL</span>' : ''}
                    </td>
                    <td class="event-source">${event.source}</td>
                    <td class="event-time">${this.formatTimestamp(event.timestamp)}</td>
                    <td>
                      <div class="event-data" onclick="this.classList.toggle('event-data-expanded')">
                        ${JSON.stringify(event.data, null, 2)}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: this.isRecording ? 'Pause' : 'Resume',
        variant: this.isRecording ? 'secondary' : 'primary',
        action: () => {
          this.isRecording = !this.isRecording;
        }
      },
      {
        label: 'Clear Events',
        variant: 'danger',
        action: () => {
          this.events = [];
          localStorage.removeItem(EventTimelinePanel.EVENTS_STORAGE_KEY);
        }
      },
      {
        label: 'Export Events',
        variant: 'primary',
        action: () => {
          const dataStr = JSON.stringify(this.events, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `events-${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
    ];
  }
}