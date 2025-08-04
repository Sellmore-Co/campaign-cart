/**
 * Events Panel Component
 * Displays event timeline and analytics
 */

import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { DebugEvent } from '../DebugEventManager';

export class EventsPanel implements DebugPanel {
  id = 'events';
  title = 'Event Timeline';
  icon = '📋';
  
  constructor(private events: DebugEvent[]) {}

  getContent(): string {
    // Fallback to first tab's content if tabs are not being used
    const tabs = this.getTabs();
    return tabs[0]?.getContent() || '';
  }

  getTabs(): PanelTab[] {
    return [
      {
        id: 'overview',
        label: 'Overview',
        icon: '📊',
        getContent: () => this.getOverviewContent()
      },
      {
        id: 'timeline',
        label: 'Timeline',
        icon: '⏰',
        getContent: () => this.getTimelineContent()
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📈',
        getContent: () => this.getAnalyticsContent()
      }
    ];
  }

  private getOverviewContent(): string {
    const eventTypes = [...new Set(this.events.map(e => e.type))];
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.events.length}</div>
              <div class="metric-label">Total Events</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${eventTypes.length}</div>
              <div class="metric-label">Event Types</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏱️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getEventsPerMinute()}</div>
              <div class="metric-label">Events/min</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Event Types</h3>
          <div class="event-types">
            ${eventTypes.map(type => {
              const count = this.events.filter(e => e.type === type).length;
              return `
                <div class="event-type-card" onclick="window.nextDebug.filterEvents('${type}')">
                  <div class="event-type-name">${type}</div>
                  <div class="event-type-count">${count}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private getTimelineContent(): string {
    const recentEvents = this.events.slice(0, 30);
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="events-timeline">
            ${recentEvents.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div class="empty-text">No events logged yet</div>
              </div>
            ` : recentEvents.map(event => `
              <div class="timeline-event">
                <div class="event-time">${event.timestamp.toLocaleTimeString()}</div>
                <div class="event-content">
                  <div class="event-header">
                    <span class="event-type-badge">${event.type}</span>
                    <span class="event-source">${event.source}</span>
                  </div>
                  <div class="event-data-preview">
                    ${this.formatEventData(event.data)}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private getAnalyticsContent(): string {
    const eventTypes = [...new Set(this.events.map(e => e.type))];
    const sourceStats = this.getSourceStatistics();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Event Distribution</h3>
          <div class="analytics-charts">
            ${eventTypes.map(type => {
              const count = this.events.filter(e => e.type === type).length;
              const percentage = this.events.length > 0 ? ((count / this.events.length) * 100).toFixed(1) : 0;
              return `
                <div class="analytics-bar">
                  <div class="bar-label">${type}</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count} (${percentage}%)</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Source Statistics</h3>
          <div class="source-stats">
            ${Object.entries(sourceStats).map(([source, count]) => `
              <div class="source-stat-item">
                <span class="source-name">${source}</span>
                <span class="source-count">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear Events',
        action: () => this.clearEvents(),
        variant: 'danger'
      },
      {
        label: 'Export Timeline',
        action: () => this.exportEvents(),
        variant: 'secondary'
      },
      {
        label: 'Start Recording',
        action: () => this.startRecording(),
        variant: 'primary'
      }
    ];
  }

  private getEventsPerMinute(): number {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentEvents = this.events.filter(e => e.timestamp > oneMinuteAgo);
    return recentEvents.length;
  }

  private getSourceStatistics(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.events.forEach(event => {
      stats[event.source] = (stats[event.source] || 0) + 1;
    });
    return stats;
  }

  private formatEventData(data: any): string {
    if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      if (keys.length === 0) return 'No data';
      if (keys.length === 1) {
        const firstKey = keys[0];
        return firstKey ? `${firstKey}: ${data[firstKey] || 'undefined'}` : 'No data';
      }
      return `${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}`;
    }
    return String(data);
  }

  private clearEvents(): void {
    this.events.length = 0;
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private exportEvents(): void {
    const data = JSON.stringify(this.events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-events-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private startRecording(): void {
    console.log('Event recording started');
    // Implementation would start intensive event monitoring
  }
}