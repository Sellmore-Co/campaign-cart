/**
 * Display Debug Panel
 * Enhanced debugging tools for the display formatting system
 */

import { DisplayContextProvider } from './DisplayContextProvider';
import { DisplayErrorBoundary } from './DisplayErrorBoundary';

interface DebugInfo {
  path: string;
  property: string;
  rawValue: any;
  format: string;
  formattedValue: string;
  context?: any;
  errors?: string[];
}

export class DisplayDebugPanel {
  private static panel: HTMLDivElement | null = null;
  private static isEnabled = false;
  private static hoveredElement: HTMLElement | null = null;
  private static updateTimer: number | null = null;
  
  /**
   * Initialize the debug panel
   */
  static init(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    this.isEnabled = true;
    this.createPanel();
    this.setupEventListeners();
    
    // Add keyboard shortcut (Ctrl+Shift+D) to toggle panel
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
    
    console.log('[DisplayDebugPanel] Initialized. Press Ctrl+Shift+D to toggle.');
  }
  
  /**
   * Create the debug panel UI
   */
  private static createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'display-debug-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 80vh;
      background: rgba(0, 0, 0, 0.9);
      color: #fff;
      border: 2px solid #0099ff;
      border-radius: 8px;
      padding: 15px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      z-index: 999999;
      overflow-y: auto;
      display: none;
      box-shadow: 0 4px 20px rgba(0, 153, 255, 0.3);
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Display Debug Panel';
    title.style.margin = '0';
    title.style.color = '#0099ff';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 25px;
      height: 25px;
    `;
    closeBtn.onclick = () => this.hide();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    this.panel.appendChild(header);
    
    // Create content area
    const content = document.createElement('div');
    content.id = 'debug-panel-content';
    this.panel.appendChild(content);
    
    // Add to body
    document.body.appendChild(this.panel);
  }
  
  /**
   * Setup event listeners for hover detection
   */
  private static setupEventListeners(): void {
    document.addEventListener('mouseover', (e) => {
      if (!this.isEnabled || !this.panel || this.panel.style.display === 'none') return;
      
      const target = e.target as HTMLElement;
      if (target.hasAttribute('data-next-display')) {
        // Debounce updates
        if (this.updateTimer) {
          clearTimeout(this.updateTimer);
        }
        
        this.updateTimer = window.setTimeout(() => {
          this.hoveredElement = target;
          this.updateDebugInfo(target);
        }, 100);
        
        // Highlight element
        target.style.outline = '2px solid #0099ff';
        target.style.outlineOffset = '2px';
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target === this.hoveredElement) {
        target.style.outline = '';
        target.style.outlineOffset = '';
      }
    });
  }
  
  /**
   * Update debug information for an element
   */
  private static updateDebugInfo(element: HTMLElement): void {
    const content = document.getElementById('debug-panel-content');
    if (!content) return;
    
    // Get debug data
    const debugData = element.getAttribute('data-format-debug');
    let info: DebugInfo;
    
    if (debugData) {
      try {
        info = JSON.parse(debugData);
      } catch {
        info = this.extractDebugInfo(element);
      }
    } else {
      info = this.extractDebugInfo(element);
    }
    
    // Get context information
    const context = DisplayContextProvider.resolve(element);
    if (context) {
      info.context = context;
    }
    
    // Get error statistics
    const errorStats = DisplayErrorBoundary.getErrorStats();
    const relevantErrors = Array.from(errorStats.entries())
      .filter(([key]) => key.includes(info.path) || key.includes(info.property))
      .map(([key, stats]) => `${key}: ${stats.count} errors`);
    
    if (relevantErrors.length > 0) {
      info.errors = relevantErrors;
    }
    
    // Render debug info
    content.innerHTML = this.renderDebugInfo(info);
  }
  
  /**
   * Extract debug information from element attributes
   */
  private static extractDebugInfo(element: HTMLElement): DebugInfo {
    return {
      path: element.getAttribute('data-next-display') || 'unknown',
      property: element.getAttribute('data-next-display')?.split('.').pop() || 'unknown',
      rawValue: element.textContent,
      format: element.getAttribute('data-format') || 'auto',
      formattedValue: element.textContent || ''
    };
  }
  
  /**
   * Render debug information as HTML
   */
  private static renderDebugInfo(info: DebugInfo): string {
    const sections = [];
    
    // Basic info
    sections.push(`
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #0099ff;">Element Info</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px; color: #999;">Path:</td>
            <td style="padding: 4px; color: #fff; font-weight: bold;">${this.escapeHtml(info.path)}</td>
          </tr>
          <tr>
            <td style="padding: 4px; color: #999;">Property:</td>
            <td style="padding: 4px; color: #fff;">${this.escapeHtml(info.property)}</td>
          </tr>
          <tr>
            <td style="padding: 4px; color: #999;">Format:</td>
            <td style="padding: 4px; color: #fff;">
              <span style="background: #333; padding: 2px 6px; border-radius: 3px;">${info.format}</span>
            </td>
          </tr>
        </table>
      </div>
    `);
    
    // Value info
    sections.push(`
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #0099ff;">Values</h4>
        <div style="background: #111; padding: 10px; border-radius: 4px; margin-bottom: 5px;">
          <div style="color: #999; font-size: 10px; margin-bottom: 3px;">Raw Value:</div>
          <div style="color: #fff; word-break: break-all;">${this.formatValue(info.rawValue)}</div>
        </div>
        <div style="background: #111; padding: 10px; border-radius: 4px;">
          <div style="color: #999; font-size: 10px; margin-bottom: 3px;">Formatted Value:</div>
          <div style="color: #0f0; font-weight: bold;">${this.escapeHtml(info.formattedValue)}</div>
        </div>
      </div>
    `);
    
    // Context info
    if (info.context) {
      sections.push(`
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #0099ff;">Context</h4>
          <div style="background: #111; padding: 10px; border-radius: 4px;">
            <pre style="margin: 0; color: #fff; font-size: 11px;">${JSON.stringify(info.context, null, 2)}</pre>
          </div>
        </div>
      `);
    }
    
    // Error info
    if (info.errors && info.errors.length > 0) {
      sections.push(`
        <div style="margin-bottom: 15px;">
          <h4 style="margin: 0 0 10px 0; color: #ff3333;">Errors</h4>
          <ul style="margin: 0; padding-left: 20px; color: #ff9999;">
            ${info.errors.map(err => `<li>${this.escapeHtml(err)}</li>`).join('')}
          </ul>
        </div>
      `);
    }
    
    // Quick actions
    sections.push(`
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
        <button onclick="console.log(${JSON.stringify(info)})" style="
          background: #0099ff;
          border: none;
          color: #fff;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          margin-right: 5px;
        ">Log to Console</button>
        <button onclick="navigator.clipboard.writeText(${JSON.stringify(JSON.stringify(info))})" style="
          background: #666;
          border: none;
          color: #fff;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
        ">Copy JSON</button>
      </div>
    `);
    
    return sections.join('');
  }
  
  /**
   * Format value for display
   */
  private static formatValue(value: any): string {
    if (value === null) return '<null>';
    if (value === undefined) return '<undefined>';
    if (value === '') return '<empty string>';
    if (typeof value === 'object') {
      return this.escapeHtml(JSON.stringify(value, null, 2));
    }
    return this.escapeHtml(String(value));
  }
  
  /**
   * Escape HTML for safe display
   */
  private static escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  /**
   * Show the debug panel
   */
  static show(): void {
    if (this.panel) {
      this.panel.style.display = 'block';
    }
  }
  
  /**
   * Hide the debug panel
   */
  static hide(): void {
    if (this.panel) {
      this.panel.style.display = 'none';
    }
    
    // Remove any element highlights
    if (this.hoveredElement) {
      this.hoveredElement.style.outline = '';
      this.hoveredElement.style.outlineOffset = '';
      this.hoveredElement = null;
    }
  }
  
  /**
   * Toggle panel visibility
   */
  static toggle(): void {
    if (this.panel) {
      if (this.panel.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }
    }
  }
  
  /**
   * Destroy the debug panel
   */
  static destroy(): void {
    this.hide();
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
    this.isEnabled = false;
  }
  
  /**
   * Log all display elements to console
   */
  static logAllElements(): void {
    const elements = document.querySelectorAll('[data-next-display]');
    const data: any[] = [];
    
    elements.forEach((el) => {
      const element = el as HTMLElement;
      const debugData = element.getAttribute('data-format-debug');
      
      data.push({
        element,
        path: element.getAttribute('data-next-display'),
        format: element.getAttribute('data-format') || 'auto',
        value: element.textContent,
        debugData: debugData ? JSON.parse(debugData) : null,
        context: DisplayContextProvider.resolve(element)
      });
    });
    
    console.table(data);
    console.log(`Total display elements: ${elements.length}`);
  }
}