/**
 * Storage Panel Component
 * Displays and manages localStorage and sessionStorage data
 */

import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

export class StoragePanel implements DebugPanel {
  id = 'storage';
  title = 'Storage';
  icon = '💾';

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
        id: 'next-data',
        label: 'Next Data',
        icon: '🏷️',
        getContent: () => this.getNextContent()
      },
      {
        id: 'local-storage',
        label: 'Local Storage',
        icon: '💾',
        getContent: () => this.getLocalStorageContent()
      },
      {
        id: 'session-storage',
        label: 'Session Storage',
        icon: '⏰',
        getContent: () => this.getSessionStorageContent()
      }
    ];
  }

  private getOverviewContent(): string {
    const localStorage = this.getLocalStorageData();
    const sessionStorage = this.getSessionStorageData();
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">💾</div>
            <div class="metric-content">
              <div class="metric-value">${localStorage.length}</div>
              <div class="metric-label">LocalStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">⏰</div>
            <div class="metric-content">
              <div class="metric-value">${sessionStorage.length}</div>
              <div class="metric-label">SessionStorage Items</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📊</div>
            <div class="metric-content">
              <div class="metric-value">${this.getStorageSize()}KB</div>
              <div class="metric-label">Total Size</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏷️</div>
            <div class="metric-content">
              <div class="metric-value">${this.getNextItems().length}</div>
              <div class="metric-label">Next Items</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getNextContent(): string {
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${this.getNextItems().length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No Next storage items found</div>
              </div>
            ` : `
              ${this.getNextItems().map(item => `
                <div class="storage-item-card next-item">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type ${item.type}">${item.type}</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', '${item.type}')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      </div>
    `;
  }

  private getLocalStorageContent(): string {
    const localStorage = this.getLocalStorageData();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${localStorage.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">💾</div>
                <div class="empty-text">No localStorage items</div>
              </div>
            ` : `
              ${localStorage.map(item => `
                <div class="storage-item-card ${item.key.includes('next') ? 'next-item' : ''}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type local">local</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'local')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      </div>
    `;
  }

  private getSessionStorageContent(): string {
    const sessionStorage = this.getSessionStorageData();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="storage-items">
            ${sessionStorage.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">⏰</div>
                <div class="empty-text">No sessionStorage items</div>
              </div>
            ` : `
              ${sessionStorage.map(item => `
                <div class="storage-item-card ${item.key.includes('next') ? 'next-item' : ''}">
                  <div class="storage-item-header">
                    <span class="storage-key">${item.key}</span>
                    <span class="storage-type session">session</span>
                    <button class="storage-delete-btn" onclick="window.nextDebug.deleteStorageItem('${item.key}', 'session')">×</button>
                  </div>
                  <div class="storage-item-size">${item.size} bytes</div>
                  <div class="storage-item-value">
                    <pre><code>${item.formattedValue}</code></pre>
                  </div>
                </div>
              `).join('')}
            `}
          </div>
        </div>
      </div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Clear Next Data',
        action: () => this.clearNextStorage(),
        variant: 'danger'
      },
      {
        label: 'Clear All Local',
        action: () => this.clearLocalStorage(),
        variant: 'danger'
      },
      {
        label: 'Clear All Session',
        action: () => this.clearSessionStorage(),
        variant: 'danger'
      },
      {
        label: 'Export Storage',
        action: () => this.exportStorage(),
        variant: 'secondary'
      }
    ];
  }

  private getLocalStorageData(): Array<{
    key: string;
    value: string;
    size: number;
    formattedValue: string;
  }> {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }

  private getSessionStorageData(): Array<{
    key: string;
    value: string;
    size: number;
    formattedValue: string;
  }> {
    const items = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || '';
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value)
        });
      }
    }
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }

  private getNextItems(): Array<{
    key: string;
    value: string;
    size: number;
    formattedValue: string;
    type: 'local' | 'session';
  }> {
    const items = [];
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('next') || key.includes('29next') || key.includes('campaign'))) {
        const value = localStorage.getItem(key) || '';
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: 'local' as const
        });
      }
    }
    
    // Check sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('next') || key.includes('29next') || key.includes('campaign'))) {
        const value = sessionStorage.getItem(key) || '';
        items.push({
          key,
          value,
          size: new Blob([value]).size,
          formattedValue: this.formatValue(value),
          type: 'session' as const
        });
      }
    }
    
    return items.sort((a, b) => a.key.localeCompare(b.key));
  }

  private formatValue(value: string): string {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, truncate long strings
      if (value.length > 200) {
        return value.substring(0, 200) + '...';
      }
      return value;
    }
  }

  private getStorageSize(): number {
    let total = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        total += new Blob([key + value]).size;
      }
    }
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key) || '';
        total += new Blob([key + value]).size;
      }
    }
    
    return Math.round(total / 1024); // Convert to KB
  }

  private clearNextStorage(): void {
    if (confirm('Are you sure you want to clear all Next storage data?')) {
      const nextItems = this.getNextItems();
      nextItems.forEach(item => {
        if (item.type === 'local') {
          localStorage.removeItem(item.key);
        } else {
          sessionStorage.removeItem(item.key);
        }
      });
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }

  private clearLocalStorage(): void {
    if (confirm('Are you sure you want to clear ALL localStorage data?')) {
      localStorage.clear();
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }

  private clearSessionStorage(): void {
    if (confirm('Are you sure you want to clear ALL sessionStorage data?')) {
      sessionStorage.clear();
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }

  private exportStorage(): void {
    const data = {
      localStorage: this.getLocalStorageData(),
      sessionStorage: this.getSessionStorageData(),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-data-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}