/**
 * Debug Style Loader
 * Lazy loads debug CSS files only when debug mode is active
 */

// Import all debug styles
import baseCSS from '../../styles/debug/base.css?inline';
import sidebarCSS from '../../styles/debug/sidebar.css?inline';
import panelsCSS from '../../styles/debug/panels.css?inline';
import componentsCSS from '../../styles/debug/components.css?inline';
import campaignCSS from '../../styles/debug/campaign.css?inline';
import panelComponentsCSS from '../../styles/debug/panel-components.css?inline';
import eventTimelineCSS from '../../styles/debug/event-timeline.css?inline';

export class DebugStyleLoader {
  private static styleElement: HTMLStyleElement | null = null;
  private static isLoading = false;

  public static async loadDebugStyles(): Promise<void> {
    if (this.isLoading || this.styleElement) return;
    
    this.isLoading = true;
    
    try {
      // Create a single style element with all debug CSS
      const combinedCSS = await this.getDebugStyles();
      
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'debug-overlay-styles';
      this.styleElement.textContent = combinedCSS;
      document.head.appendChild(this.styleElement);
      
      console.log('🎨 Debug styles injected');
    } catch (error) {
      console.error('Failed to load debug styles:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  public static async getDebugStyles(): Promise<string> {
    // Return combined CSS for use in Shadow DOM
    return [
      baseCSS,
      sidebarCSS,
      panelsCSS,
      componentsCSS,
      campaignCSS,
      panelComponentsCSS,
      eventTimelineCSS
    ].join('\n');
  }

  public static removeDebugStyles(): void {
    // Remove the style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    
    // Also remove by ID in case it was added elsewhere
    const existingStyle = document.getElementById('debug-overlay-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  }
}