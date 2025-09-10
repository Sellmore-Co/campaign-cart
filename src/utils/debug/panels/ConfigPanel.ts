/**
 * Config Panel Component
 * Displays and manages SDK configuration
 */

import { useConfigStore } from '../../../stores/configStore';
import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { RawDataHelper } from './RawDataHelper';

export class ConfigPanel implements DebugPanel {
  id = 'config';
  title = 'Configuration';
  icon = '⚙️';

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
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        getContent: () => this.getSettingsContent()
      },
      {
        id: 'raw',
        label: 'Raw Data',
        icon: '🔧',
        getContent: () => this.getRawDataContent()
      }
    ];
  }

  private getOverviewContent(): string {
    const config = useConfigStore.getState();
    const sdkVersion = typeof window !== 'undefined' && (window as any).__NEXT_SDK_VERSION__ 
      ? (window as any).__NEXT_SDK_VERSION__ 
      : '1.0.0';
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">🔧</div>
            <div class="metric-content">
              <div class="metric-value">${config.debug ? 'ON' : 'OFF'}</div>
              <div class="metric-label">Debug Mode</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🌍</div>
            <div class="metric-content">
              <div class="metric-value">${config.environment || 'production'}</div>
              <div class="metric-label">Environment</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🔑</div>
            <div class="metric-content">
              <div class="metric-value">${config.apiKey ? 'SET' : 'MISSING'}</div>
              <div class="metric-label">API Key</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📦</div>
            <div class="metric-content">
              <div class="metric-value">${sdkVersion}</div>
              <div class="metric-label">SDK Version</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getSettingsContent(): string {
    const config = useConfigStore.getState();
    const sdkVersion = typeof window !== 'undefined' && (window as any).__NEXT_SDK_VERSION__ 
      ? (window as any).__NEXT_SDK_VERSION__ 
      : '1.0.0';
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="config-groups">
            <div class="config-group">
              <h4 class="config-group-title">Core Settings</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">SDK Version:</span>
                  <span class="config-value">${sdkVersion}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">API Key:</span>
                  <span class="config-value">${config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set'}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Environment:</span>
                  <span class="config-value">${config.environment || 'production'}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Base URL:</span>
                  <span class="config-value">https://campaigns.apps.29next.com</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Feature Flags</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Debug Mode:</span>
                  <span class="config-value ${config.debug ? 'enabled' : 'disabled'}">${config.debug ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Test Mode:</span>
                  <span class="config-value ${(config.testMode ?? false) ? 'enabled' : 'disabled'}">${(config.testMode ?? false) ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Analytics:</span>
                  <span class="config-value ${(config.enableAnalytics ?? true) ? 'enabled' : 'disabled'}">${(config.enableAnalytics ?? true) ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Auto Initialize:</span>
                  <span class="config-value ${(config.autoInit ?? true) ? 'enabled' : 'disabled'}">${(config.autoInit ?? true) ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div class="config-group">
              <h4 class="config-group-title">Performance</h4>
              <div class="config-items">
                <div class="config-item">
                  <span class="config-key">Rate Limit:</span>
                  <span class="config-value">${config.rateLimit ?? 4} req/sec</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Cache TTL:</span>
                  <span class="config-value">${config.cacheTtl ?? 300}s</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Retry Attempts:</span>
                  <span class="config-value">${config.retryAttempts ?? 3}</span>
                </div>
                <div class="config-item">
                  <span class="config-key">Timeout:</span>
                  <span class="config-value">${config.timeout ?? 10000}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getRawDataContent(): string {
    const config = useConfigStore.getState();
    return RawDataHelper.generateRawDataContent(config);
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Toggle Debug',
        action: () => this.toggleDebug(),
        variant: 'primary'
      },
      {
        label: 'Toggle Test Mode',
        action: () => this.toggleTestMode(),
        variant: 'secondary'
      },
      {
        label: 'Export Config',
        action: () => this.exportConfig(),
        variant: 'secondary'
      },
      {
        label: 'Reset Config',
        action: () => this.resetConfig(),
        variant: 'danger'
      }
    ];
  }

  private toggleDebug(): void {
    const configStore = useConfigStore.getState();
    configStore.updateConfig({ debug: !configStore.debug });
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private toggleTestMode(): void {
    const configStore = useConfigStore.getState();
    configStore.updateConfig({ testMode: !(configStore.testMode ?? false) });
    document.dispatchEvent(new CustomEvent('debug:update-content'));
  }

  private exportConfig(): void {
    const config = useConfigStore.getState();
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `next-config-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private resetConfig(): void {
    if (confirm('Are you sure you want to reset the configuration to defaults?')) {
      const configStore = useConfigStore.getState();
      configStore.reset();
      document.dispatchEvent(new CustomEvent('debug:update-content'));
    }
  }
}