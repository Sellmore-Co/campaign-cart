/**
 * API Panel Component
 * Monitors and displays API requests with response details
 */

import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

interface APIRequest {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
  requestData?: any;
  responseData?: any;
}

export class APIPanel implements DebugPanel {
  id = 'api';
  title = 'API Requests';
  icon = '🌐';

  private requests: APIRequest[] = [];

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
        id: 'requests',
        label: 'Request History',
        icon: '📋',
        getContent: () => this.getRequestsContent()
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: '⚡',
        getContent: () => this.getPerformanceContent()
      }
    ];
  }

  private getOverviewContent(): string {
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.requests.length}</div>
              <div class="metric-label">Total Requests</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">✅</div>
            <div class="metric-content">
              <div class="metric-value">${this.requests.filter(r => r.status < 400).length}</div>
              <div class="metric-label">Successful</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">❌</div>
            <div class="metric-content">
              <div class="metric-value">${this.requests.filter(r => r.status >= 400).length}</div>
              <div class="metric-label">Failed</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-content">
              <div class="metric-value">${this.getAverageResponseTime()}ms</div>
              <div class="metric-label">Avg Response</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getRequestsContent(): string {
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="requests-list">
            ${this.requests.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">🌐</div>
                <div class="empty-text">No API requests yet</div>
              </div>
            ` : this.requests.slice().reverse().map(request => `
              <div class="request-card ${request.status >= 400 ? 'error' : 'success'}">
                <div class="request-header">
                  <span class="request-method ${request.method.toLowerCase()}">${request.method}</span>
                  <span class="request-url">${this.shortenUrl(request.url)}</span>
                  <span class="request-status status-${Math.floor(request.status / 100)}xx">${request.status}</span>
                  <span class="request-time">${request.duration}ms</span>
                </div>
                <div class="request-timestamp">${request.timestamp.toLocaleTimeString()}</div>
                ${request.requestData || request.responseData ? `
                  <details class="request-details">
                    <summary>Request/Response Data</summary>
                    ${request.requestData ? `
                      <div class="request-data">
                        <h4>Request:</h4>
                        <pre><code>${JSON.stringify(request.requestData, null, 2)}</code></pre>
                      </div>
                    ` : ''}
                    ${request.responseData ? `
                      <div class="response-data">
                        <h4>Response:</h4>
                        <pre><code>${JSON.stringify(request.responseData, null, 2)}</code></pre>
                      </div>
                    ` : ''}
                  </details>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private getPerformanceContent(): string {
    const methodStats = this.getMethodStatistics();
    const recentRequests = this.requests.slice(-10);
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Performance by Method</h3>
          <div class="method-stats">
            ${Object.entries(methodStats).map(([method, stats]) => `
              <div class="method-stat-card">
                <div class="method-name">${method}</div>
                <div class="method-metrics">
                  <span class="metric">Count: ${stats.count}</span>
                  <span class="metric">Avg: ${stats.avgTime}ms</span>
                  <span class="metric">Max: ${stats.maxTime}ms</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Recent Performance</h3>
          <div class="performance-chart">
            ${recentRequests.map((request, _index) => `
              <div class="performance-bar">
                <div class="bar-label">${request.method} ${this.shortenUrl(request.url)}</div>
                <div class="bar-container">
                  <div class="bar-fill" style="width: ${(request.duration / 1000) * 100}%"></div>
                  <div class="bar-value">${request.duration}ms</div>
                </div>
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
        label: 'Clear History',
        action: () => this.clearHistory(),
        variant: 'danger'
      },
      {
        label: 'Test API',
        action: () => this.testApiConnection(),
        variant: 'primary'
      },
      {
        label: 'Export Requests',
        action: () => this.exportRequests(),
        variant: 'secondary'
      }
    ];
  }

  private shortenUrl(url: string): string {
    return url.replace('https://campaigns.apps.29next.com', '');
  }

  private getAverageResponseTime(): number {
    if (this.requests.length === 0) return 0;
    const total = this.requests.reduce((sum, req) => sum + req.duration, 0);
    return Math.round(total / this.requests.length);
  }

  private getMethodStatistics(): Record<string, { count: number; avgTime: number; maxTime: number }> {
    const stats: Record<string, { count: number; totalTime: number; maxTime: number }> = {};
    
    this.requests.forEach(request => {
      if (!stats[request.method]) {
        stats[request.method] = { count: 0, totalTime: 0, maxTime: 0 };
      }
      const methodStats = stats[request.method];
      if (methodStats) {
        methodStats.count++;
        methodStats.totalTime += request.duration;
        methodStats.maxTime = Math.max(methodStats.maxTime, request.duration);
      }
    });

    const result: Record<string, { count: number; avgTime: number; maxTime: number }> = {};
    Object.entries(stats).forEach(([method, stat]) => {
      result[method] = {
        count: stat.count,
        avgTime: Math.round(stat.totalTime / stat.count),
        maxTime: stat.maxTime
      };
    });

    return result;
  }

  private clearHistory(): void {
    this.requests = [];
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private async testApiConnection(): Promise<void> {
    try {
      const start = Date.now();
      const response = await fetch('https://campaigns.apps.29next.com/health');
      const duration = Date.now() - start;
      
      this.requests.push({
        id: Date.now().toString(),
        method: 'GET',
        url: 'https://campaigns.apps.29next.com/health',
        status: response.status,
        duration,
        timestamp: new Date()
      });
      
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    } catch (error) {
      console.error('API test failed:', error);
    }
  }

  private exportRequests(): void {
    const data = JSON.stringify(this.requests, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-requests-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public addRequest(request: APIRequest): void {
    this.requests.push(request);
    // Keep only last 50 requests
    if (this.requests.length > 50) {
      this.requests.shift();
    }
  }
}