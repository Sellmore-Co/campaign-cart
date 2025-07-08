/**
 * Enhanced Debug UI - Beautiful bottom-docked debug overlay
 * Modern design with better UX and comprehensive functionality
 */

import { DebugPanel } from './DebugPanels';

export class EnhancedDebugUI {

  public static createOverlayHTML(
    panels: DebugPanel[], 
    activePanel: string, 
    isExpanded: boolean,
    activePanelTab?: string
  ): string {
    const activePanelData = panels.find(p => p.id === activePanel);

    return `
      <div class="enhanced-debug-overlay ${isExpanded ? 'expanded' : 'collapsed'}">
        ${this.createBottomBar(isExpanded)}
        ${isExpanded ? this.createExpandedContent(panels, activePanelData, activePanel, activePanelTab) : ''}
      </div>
    `;
  }

  private static createBottomBar(isExpanded: boolean): string {
    return `
      <div class="debug-bottom-bar">
        <div class="debug-logo-section">
          ${this.get29NextLogo()}
          <span class="debug-title">Debug Tools</span>
          <div class="debug-status">
            <div class="status-indicator active"></div>
            <span class="status-text">Active</span>
          </div>
        </div>
        
        <div class="debug-quick-stats">
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-items">0</span>
            <span class="stat-label">Items</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="cart-total">$0.00</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="enhanced-elements">0</span>
            <span class="stat-label">Enhanced</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" data-debug-stat="api-requests">0</span>
            <span class="stat-label">Requests</span>
          </div>
        </div>

        <div class="debug-controls">
          <button class="debug-control-btn" data-action="toggle-mini-cart" title="Toggle Mini Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="clear-cart" title="Clear Cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="highlight-elements" title="Highlight Enhanced Elements">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="export-data" title="Export Debug Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
          <button class="debug-expand-btn" data-action="toggle-expand" title="${isExpanded ? 'Collapse' : 'Expand'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="expand-icon ${isExpanded ? 'rotated' : ''}">
              <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
            </svg>
          </button>
          <button class="debug-control-btn close-btn" data-action="close" title="Close Debug Tools">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private static createExpandedContent(
    panels: DebugPanel[], 
    activePanel: DebugPanel | undefined, 
    activePanelId: string,
    activePanelTab?: string
  ): string {
    return `
      <div class="debug-expanded-content">
        <div class="debug-sidebar">
          ${this.createPanelTabs(panels, activePanelId)}
          <div class="debug-sidebar-footer">
            <button class="sidebar-btn" data-action="reset-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23L19,8M5,12A8,8 0 0,1 12,4C13,4 13.97,4.25 14.8,4.7L16.26,3.24C15.03,2.46 13.57,2 12,2A10,10 0 0,0 2,12H5L1,16L5,20V12Z"/>
              </svg>
              Reset All
            </button>
            <button class="sidebar-btn" data-action="settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
              Settings
            </button>
          </div>
        </div>
        
        <div class="debug-main-content">
          ${this.createPanelContent(activePanel, activePanelTab)}
        </div>
      </div>
    `;
  }

  private static createPanelTabs(panels: DebugPanel[], activePanel: string): string {
    return `
      <div class="debug-panel-tabs">
        ${panels.map(panel => `
          <button class="debug-panel-tab ${panel.id === activePanel ? 'active' : ''}" 
                  data-panel="${panel.id}">
            <span class="tab-icon">${panel.icon}</span>
            <span class="tab-label">${panel.title}</span>
            ${panel.id === 'events' ? '<div class="tab-badge" data-debug-badge="events">0</div>' : ''}
          </button>
        `).join('')}
      </div>
    `;
  }

  private static createPanelContent(activePanel: DebugPanel | undefined, activePanelTab?: string): string {
    if (!activePanel) return '';

    const tabs = activePanel.getTabs?.() || [];
    const hasHorizontalTabs = tabs.length > 0;
    
    if (hasHorizontalTabs) {
      const activeTabId = activePanelTab || tabs[0]?.id;
      const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
      
      return `
        <div class="debug-panel-container">
          <div class="panel-header">
            <div class="panel-title">
              <span class="panel-icon">${activePanel.icon}</span>
              <h2>${activePanel.title}</h2>
            </div>
            ${activePanel.getActions ? `
              <div class="panel-actions">
                ${activePanel.getActions().map(action => `
                  <button class="panel-action-btn ${action.variant || 'primary'}" 
                          data-panel-action="${action.label}">
                    ${action.label}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <div class="panel-horizontal-tabs">
            ${tabs.map(tab => `
              <button class="horizontal-tab ${tab.id === activeTabId ? 'active' : ''}" 
                      data-panel-tab="${tab.id}">
                ${tab.icon ? `<span class="tab-icon">${tab.icon}</span>` : ''}
                <span class="tab-label">${tab.label}</span>
              </button>
            `).join('')}
          </div>
          
          <div class="panel-content">
            ${activeTab ? activeTab.getContent() : ''}
          </div>
        </div>
      `;
    }

    return `
      <div class="debug-panel-container">
        <div class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">${activePanel.icon}</span>
            <h2>${activePanel.title}</h2>
          </div>
          ${activePanel.getActions ? `
            <div class="panel-actions">
              ${activePanel.getActions().map(action => `
                <button class="panel-action-btn ${action.variant || 'primary'}" 
                        data-panel-action="${action.label}">
                  ${action.label}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="panel-content">
          ${activePanel.getContent()}
        </div>
      </div>
    `;
  }

  private static get29NextLogo(): string {
    return `
      <svg class="debug-logo" width="32" height="32" viewBox="0 0 518.2 99" fill="none">
        <g>
          <path d="M17.5,0c3.4,0,6.8,1,9.6,2.9l58.8,40v12.6L20.7,12.6c-1-0.6-2.1-1-3.2-1c-3.2,0-5.8,2.6-5.8,5.8v64c0,3.2,2.6,5.8,5.8,5.8h3.1V99h-3.1C7.8,99,0,91.2,0,81.5v-64C0,7.8,7.8,0,17.5,0z" fill="currentColor"/>
          <path d="M95.4,99c-3.4,0-6.8-1-9.6-2.9L27,56.1V43.5l65.2,42.8c1,0.6,2.1,1,3.2,1c3.2,0,5.8-2.6,5.8-5.8v-64c0-3.2-2.6-5.8-5.8-5.8h-3.1V0h3.1c9.7,0,17.5,7.8,17.5,17.5v64C112.9,91.2,105.1,99,95.4,99z" fill="currentColor"/>
        </g>
        <g>
          <path d="M161.1,69.5c1.9-1.9,3.8-3.5,5.9-4.9l10.1-7.5c4.4-3.2,7.9-6.6,10.4-10.2c2.5-3.7,3.8-7.8,3.8-12.5c0-4.6-1-8.7-3.2-12.2c-2.2-3.5-5.2-6.3-9.2-8.3s-8.8-3-14.3-3c-4.8,0-9.1,1-12.9,2.9c-3.8,1.9-6.9,4.4-9.2,7.5c-2.4,3.1-3.9,6.5-4.6,10.1l15,2.6c0.4-1.7,1.1-3.3,2.2-4.7c1.1-1.5,2.4-2.6,4.1-3.5c1.7-0.9,3.6-1.3,5.7-1.3c2.5,0,4.6,0.4,6.3,1.3c1.7,0.9,3,2.1,3.9,3.6c0.9,1.5,1.3,3.2,1.3,5.1c0,1.5-0.4,3.1-1.3,4.7c-0.9,1.6-2,3.1-3.4,4.5c-1.4,1.4-2.8,2.6-4.4,3.7L156,55.6c-3.1,2.1-5.7,4.5-8,7c-2.2,2.6-4,5.1-5.3,7.6s-1.9,4.8-1.9,6.9l0.1,0.1V88h51.5V75h-35.2C158.3,73,159.6,71.1,161.1,69.5z" fill="currentColor"/>
          <path d="M248.3,20.8c-2.2-3.2-5.1-5.7-8.6-7.6c-3.5-1.9-7.8-2.8-12.8-2.8c-5.3,0-10,1-14.2,3.1c-4,2.1-7.1,5-9.3,8.6c-2.2,3.6-3.3,7.8-3.3,12.6c0,4.9,1,9.2,3.1,13c2,3.8,4.9,6.8,8.6,9.1s7.9,3.4,12.6,3.4c4.7,0,8.8-1.2,12.2-3.6c1.7-1.2,3.2-2.6,4.5-4.2c-0.4,6.9-1.8,12.2-4.2,15.9c-3.1,4.9-7.5,7.4-13,7.4c-2.1,0-4.4-0.3-6.9-1.1c-2.5-0.8-4.9-1.9-7.2-3.4L202.7,82c3,2.1,6.4,3.7,10.1,4.9c3.7,1.2,7.5,1.8,11.4,1.8c5.4,0,10-1.1,13.8-3.4s7-5.4,9.4-9.3c2.5-3.9,4.3-8.4,5.5-13.6c1.2-5.2,1.8-10.7,1.8-16.5c0-4.9-0.5-9.5-1.5-13.8C252.2,27.8,250.5,24,248.3,20.8z M237.6,41.9c-1.1,1.9-2.6,3.4-4.4,4.5c-1.9,1.1-4,1.6-6.3,1.6c-2.4,0-4.5-0.5-6.3-1.6c-1.9-1-3.3-2.6-4.4-4.5c-1.1-1.9-1.6-4.1-1.6-6.6s0.5-4.6,1.6-6.5c1.1-1.8,2.6-3.3,4.4-4.4c1.9-1.1,4-1.6,6.3-1.6c2.4,0,4.5,0.5,6.3,1.6c1.8,1,3.3,2.5,4.4,4.4c1.1,1.9,1.6,4,1.6,6.5S238.7,40,237.6,41.9z" fill="currentColor"/>
        </g>
      </svg>
    `;
  }

  public static addStyles(): void {
    // Styles are now loaded via CSS modules - this method kept for compatibility
    console.log('Debug styles loaded via CSS modules');
  }

  public static removeStyles(): void {
    // Styles are now loaded via CSS modules - cleanup handled by DebugStyleLoader
    console.log('Debug styles will be cleaned up by DebugStyleLoader');
  }
}