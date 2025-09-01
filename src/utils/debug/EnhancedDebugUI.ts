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
          <button class="debug-control-btn" data-action="toggle-xray" title="Toggle X-Ray View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3C3.89 3 3 3.9 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.9 20.11 3 19 3H5M5 5H19V19H5V5M7 7V9H9V7H7M11 7V9H13V7H11M15 7V9H17V7H15M7 11V13H9V11H7M11 11V13H13V11H11M15 11V13H17V11H15M7 15V17H9V15H7M11 15V17H13V15H11M15 15V17H17V15H15Z"/>
            </svg>
          </button>
          <button class="debug-control-btn" data-action="export-data" title="Export Debug Data">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
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
          
          <div class="panel-content ${activePanel.id === 'events' || activePanel.id === 'event-timeline' || (activePanel.id === 'order' && activeTabId === 'lines') || activeTabId === 'raw' ? 'no-padding' : ''}">
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
        <div class="panel-content ${activePanel.id === 'events' || activePanel.id === 'event-timeline' || activePanel.id === 'order' ? 'no-padding' : ''}">
          ${activePanel.getContent()}
        </div>
      </div>
    `;
  }

  private static get29NextLogo(): string {
    return `
      <svg class="debug-logo" width="32" height="32" viewBox="0 0 115.4 101.9" fill="none">
        <defs>
          <style>
            .st0 {
              fill: currentColor;
              stroke: currentColor;
              stroke-width: 2.5px;
            }
          </style>
        </defs>
        <path class="st0" d="M83.5,58.3l-1.9-1.3L27.2,21.2c-.7-.4-1.4-.6-2-.6-2,0-3.6,1.6-3.6,3.6v53.4c0,2,1.6,3.6,3.6,3.6h3.8v12.3h-3.8c-8.8,0-15.8-7.1-15.8-15.8V24.3c0-8.8,7.1-15.8,15.8-15.8,3.1,0,6.2.9,8.7,2.6h0l49,33.4.5.4v13.5ZM90.2,8.4c8.8,0,15.8,7.1,15.8,15.8v53.4c0,8.8-7.1,15.8-15.8,15.8s-6.2-.9-8.7-2.6h0l-49-33.4-.5-.4v-13.5l1.9,1.3,54.3,35.7c.7.4,1.4.7,2,.7,2,0,3.6-1.6,3.6-3.6V24.3c0-2-1.6-3.6-3.6-3.6h-3.8v-12.3h3.8Z"/>
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