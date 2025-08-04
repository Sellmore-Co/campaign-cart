/**
 * Debug Module - Lazy-loaded debug overlay system
 * Only loads when debug mode is activated
 */

import { Logger } from '../logger';

export interface DebugModuleInterface {
  initialize(): void;
  show(): void;
  hide(): void;
  toggle(): void;
  isVisible(): boolean;
}

let debugOverlayInstance: DebugModuleInterface | null = null;
let isLoading = false;

export class DebugModule {
  private static logger = new Logger('DebugModule');

  /**
   * Lazy load and initialize the debug overlay
   */
  public static async loadDebugOverlay(): Promise<DebugModuleInterface> {
    if (debugOverlayInstance) {
      return debugOverlayInstance;
    }

    if (isLoading) {
      // Wait for existing load to complete
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (debugOverlayInstance) {
            resolve(debugOverlayInstance);
          } else if (!isLoading) {
            // Loading failed, reject the promise
            reject(new Error('Debug overlay failed to load'));
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      });
    }

    isLoading = true;
    this.logger.info('Loading debug overlay module...');

    try {
      // Load styles first
      const { DebugStyleLoader } = await import('./DebugStyleLoader');
      await DebugStyleLoader.loadDebugStyles();

      // Then load the debug overlay
      const { debugOverlay } = await import('./DebugOverlay');
      
      debugOverlayInstance = debugOverlay;
      isLoading = false;
      
      this.logger.info('Debug overlay module loaded successfully ✅');
      return debugOverlayInstance;
      
    } catch (error) {
      isLoading = false;
      this.logger.error('Failed to load debug overlay module:', error);
      throw error;
    }
  }

  /**
   * Initialize debug mode if enabled
   */
  public static async initializeIfEnabled(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const isDebugMode = urlParams.get('debugger') === 'true';
    
    if (!isDebugMode) return;

    try {
      const overlay = await this.loadDebugOverlay();
      overlay.initialize();
      
      // Set up global debug access
      this.setupGlobalDebugAccess(overlay);
      
    } catch (error) {
      this.logger.error('Failed to initialize debug mode:', error);
    }
  }

  /**
   * Manually enable debug mode
   */
  public static async enableDebugMode(): Promise<DebugModuleInterface> {
    const overlay = await this.loadDebugOverlay();
    overlay.show();
    
    // Update URL to reflect debug mode
    const url = new URL(window.location.href);
    url.searchParams.set('debugger', 'true');
    window.history.replaceState({}, '', url.toString());
    
    this.setupGlobalDebugAccess(overlay);
    return overlay;
  }

  /**
   * Disable debug mode and cleanup
   */
  public static disableDebugMode(): void {
    if (debugOverlayInstance) {
      debugOverlayInstance.hide();
    }

    // Remove debug parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('debugger');
    window.history.replaceState({}, '', url.toString());

    // Clean up global access
    if (typeof window !== 'undefined') {
      delete (window as any).nextDebug;
    }

    // Optionally clean up styles
    import('./DebugStyleLoader').then(({ DebugStyleLoader }) => {
      DebugStyleLoader.removeDebugStyles();
    });
  }

  /**
   * Check if debug mode is currently active
   */
  public static isDebugMode(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('debugger') === 'true';
  }

  /**
   * Toggle debug mode on/off
   */
  public static async toggleDebugMode(): Promise<void> {
    if (this.isDebugMode()) {
      this.disableDebugMode();
    } else {
      await this.enableDebugMode();
    }
  }

  /**
   * Set up global debug access for console usage
   */
  private static setupGlobalDebugAccess(overlay: DebugModuleInterface): void {
    if (typeof window === 'undefined') return;

    (window as any).nextDebug = {
      ...(window as any).nextDebug, // Preserve existing debug utilities
      overlay,
      enableDebug: () => this.enableDebugMode(),
      disableDebug: () => this.disableDebugMode(),
      toggleDebug: () => this.toggleDebugMode(),
      isDebugMode: () => this.isDebugMode()
    };

    console.log('🐛 Debug overlay loaded! Use nextDebug.overlay to control it.');
  }
}

// Auto-initialize on DOM ready if debug mode is enabled
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      DebugModule.initializeIfEnabled();
    });
  } else {
    // DOM already loaded
    DebugModule.initializeIfEnabled();
  }
}

// Export for external access
export default DebugModule;