/**
 * Enhancer Panel Component
 * Displays DOM elements enhanced by the SDK and their status
 */

import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

export class EnhancerPanel implements DebugPanel {
  id = 'enhancers';
  title = 'Enhancers';
  icon = '🔧';

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
        id: 'elements',
        label: 'Elements',
        icon: '🔧',
        getContent: () => this.getElementsContent()
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
    const enhancedElements = this.getEnhancedElements();
    const totalElements = document.querySelectorAll('[data-next-]').length;
    const enhancerTypes = this.getEnhancerTypes();
    
    return `
      <div class="enhanced-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">⚡</div>
            <div class="metric-content">
              <div class="metric-value">${enhancedElements.length}</div>
              <div class="metric-label">Enhanced Elements</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🎯</div>
            <div class="metric-content">
              <div class="metric-value">${totalElements}</div>
              <div class="metric-label">Total Elements</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">📈</div>
            <div class="metric-content">
              <div class="metric-value">${Math.round((enhancedElements.length / totalElements) * 100) || 0}%</div>
              <div class="metric-label">Enhancement Rate</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon">🏷️</div>
            <div class="metric-content">
              <div class="metric-value">${Object.keys(enhancerTypes).length}</div>
              <div class="metric-label">Enhancer Types</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Enhancer Distribution</h3>
          <div class="enhancer-distribution">
            ${Object.entries(enhancerTypes).map(([type, count]) => `
              <div class="enhancer-dist-item">
                <span class="enhancer-type">${type}</span>
                <span class="enhancer-count">${count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private getElementsContent(): string {
    const enhancedElements = this.getEnhancedElements();
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <div class="elements-list">
            ${enhancedElements.length === 0 ? `
              <div class="empty-state">
                <div class="empty-icon">🔧</div>
                <div class="empty-text">No enhanced elements found</div>
              </div>
            ` : enhancedElements.map((element, index) => `
              <div class="element-card" onclick="window.nextDebug.highlightElement('${element.selector}')">
                <div class="element-header">
                  <span class="element-tag">${element.tagName}</span>
                  <span class="element-index">#${index + 1}</span>
                </div>
                <div class="element-attributes">
                  ${element.attributes.map(attr => `
                    <span class="attribute-tag">${attr}</span>
                  `).join('')}
                </div>
                <div class="element-enhancers">
                  ${element.enhancers.map(enhancer => `
                    <span class="enhancer-tag">${enhancer}</span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private getPerformanceContent(): string {
    const enhancedElements = this.getEnhancedElements();
    const performanceStats = this.getPerformanceStats(enhancedElements);
    
    return `
      <div class="enhanced-panel">
        <div class="section">
          <h3 class="section-title">Enhancement Performance</h3>
          <div class="performance-metrics">
            <div class="performance-metric">
              <span class="metric-label">Average Attributes per Element:</span>
              <span class="metric-value">${performanceStats.avgAttributes}</span>
            </div>
            <div class="performance-metric">
              <span class="metric-label">Most Complex Element:</span>
              <span class="metric-value">${performanceStats.mostComplex.selector} (${performanceStats.mostComplex.attributes} attrs)</span>
            </div>
            <div class="performance-metric">
              <span class="metric-label">Enhancement Coverage:</span>
              <span class="metric-value">${performanceStats.coverage}%</span>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3 class="section-title">Enhancement Timeline</h3>
          <div class="enhancement-timeline">
            <div class="timeline-item">
              <span class="timeline-time">Page Load</span>
              <span class="timeline-event">DOM Ready</span>
            </div>
            <div class="timeline-item">
              <span class="timeline-time">+50ms</span>
              <span class="timeline-event">SDK Initialized</span>
            </div>
            <div class="timeline-item">
              <span class="timeline-time">+100ms</span>
              <span class="timeline-event">Elements Scanned</span>
            </div>
            <div class="timeline-item">
              <span class="timeline-time">+150ms</span>
              <span class="timeline-event">Enhancers Applied</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getActions(): PanelAction[] {
    return [
      {
        label: 'Highlight All',
        action: () => this.highlightAllElements(),
        variant: 'primary'
      },
      {
        label: 'Clear Highlights',
        action: () => this.clearHighlights(),
        variant: 'secondary'
      },
      {
        label: 'Refresh Scan',
        action: () => this.refreshScan(),
        variant: 'secondary'
      }
    ];
  }

  private getEnhancedElements(): Array<{
    selector: string;
    tagName: string;
    attributes: string[];
    enhancers: string[];
  }> {
    const elements = document.querySelectorAll('[data-next-]');
    return Array.from(elements).map((element, index) => {
      const htmlElement = element as HTMLElement;
      const attributes = Array.from(htmlElement.attributes)
        .filter(attr => attr.name.startsWith('data-next-'))
        .map(attr => `${attr.name}="${attr.value}"`);
      
      const enhancers = this.getElementEnhancers(htmlElement);
      
      return {
        selector: this.generateSelector(htmlElement, index),
        tagName: htmlElement.tagName.toLowerCase(),
        attributes,
        enhancers
      };
    });
  }

  private generateSelector(element: HTMLElement, index: number): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return `[data-debug-element="${index}"]`;
  }

  private getElementEnhancers(element: HTMLElement): string[] {
    // This would ideally come from the actual enhancer system
    // For now, infer from data attributes
    const enhancers = [];
    const attributes = Array.from(element.attributes);
    
    if (attributes.some(attr => attr.name.includes('toggle'))) enhancers.push('CartToggle');
    if (attributes.some(attr => attr.name.includes('display'))) enhancers.push('ProductDisplay');
    if (attributes.some(attr => attr.name.includes('quantity'))) enhancers.push('QuantityControl');
    if (attributes.some(attr => attr.name.includes('checkout'))) enhancers.push('CheckoutForm');
    if (attributes.some(attr => attr.name.includes('timer'))) enhancers.push('Timer');
    
    return enhancers.length > 0 ? enhancers : ['Unknown'];
  }

  private getEnhancerTypes(): Record<string, number> {
    const enhancedElements = this.getEnhancedElements();
    const types: Record<string, number> = {};
    
    enhancedElements.forEach(element => {
      element.enhancers.forEach(enhancer => {
        types[enhancer] = (types[enhancer] || 0) + 1;
      });
    });
    
    return types;
  }

  private getPerformanceStats(elements: any[]): {
    avgAttributes: number;
    mostComplex: { selector: string; attributes: number };
    coverage: number;
  } {
    if (elements.length === 0) {
      return {
        avgAttributes: 0,
        mostComplex: { selector: 'None', attributes: 0 },
        coverage: 0
      };
    }

    const totalAttributes = elements.reduce((sum, el) => sum + el.attributes.length, 0);
    const avgAttributes = Math.round(totalAttributes / elements.length);
    
    const mostComplex = elements.reduce((max, el) => 
      el.attributes.length > max.attributes ? 
        { selector: el.selector, attributes: el.attributes.length } : 
        max
    , { selector: 'None', attributes: 0 });

    const totalElements = document.querySelectorAll('*').length;
    const coverage = Math.round((elements.length / totalElements) * 100);

    return { avgAttributes, mostComplex, coverage };
  }

  private highlightAllElements(): void {
    document.querySelectorAll('[data-next-]').forEach((element, index) => {
      element.classList.add('debug-highlight');
      element.setAttribute('data-debug-label', `Element ${index + 1}`);
    });
  }

  private clearHighlights(): void {
    document.querySelectorAll('.debug-highlight').forEach(element => {
      element.classList.remove('debug-highlight');
      element.removeAttribute('data-debug-label');
    });
  }

  private refreshScan(): void {
    // Trigger a re-scan of the DOM
    document.dispatchEvent(new CustomEvent('debug:refresh-scan'));
  }
}