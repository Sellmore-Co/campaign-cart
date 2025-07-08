/**
 * Analytics Utility
 * Handles lazy loading of analytics SDK and event tracking
 */

import { createLogger } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';

const logger = createLogger('Analytics');

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private loaded = false;
  private loading = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  /**
   * Lazy loads the analytics SDK and initializes it with campaign data
   */
  public async loadAnalyticsSDK(): Promise<void> {
    if (this.loaded) {
      logger.debug('Analytics SDK already loaded');
      return;
    }

    if (this.loading) {
      logger.debug('Analytics SDK loading in progress, waiting...');
      return this.loadPromise!;
    }

    this.loading = true;
    this.loadPromise = this.performLoad();
    
    try {
      await this.loadPromise;
      this.loaded = true;
      logger.info('Analytics SDK loaded successfully');
    } catch (error) {
      logger.error('Failed to load analytics SDK:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  private async performLoad(): Promise<void> {
    const configStore = useConfigStore.getState();

    // Get the API key from config store
    const apiKey = configStore.apiKey;
    if (!apiKey) {
      throw new Error('API key not available for analytics initialization');
    }

    const scriptUrl = `https://campaigns.apps.29next.com/js/v1/campaign/`;

    // Load the analytics script
    await this.loadScript(scriptUrl);

    // Initialize with API key
    if (typeof (window as any).nextCampaign !== 'undefined') {
      (window as any).nextCampaign.config({
        apiKey: apiKey
      });
      
      logger.debug('Analytics SDK configured with API key');
    } else {
      throw new Error('nextCampaign not available after script load');
    }
  }

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.async = true;
      script.src = url;
      
      script.onload = () => {
        logger.debug(`Analytics script loaded: ${url}`);
        resolve();
      };
      
      script.onerror = () => {
        logger.error(`Failed to load analytics script: ${url}`);
        reject(new Error(`Failed to load analytics script: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Tracks an analytics event
   */
  public async trackEvent(eventName: string, eventData: Record<string, any> = {}): Promise<void> {
    try {
      // Ensure SDK is loaded before tracking
      await this.loadAnalyticsSDK();

      if (typeof (window as any).nextCampaign !== 'undefined') {
        (window as any).nextCampaign.event(eventName, eventData);
        logger.debug(`Event tracked: ${eventName}`, eventData);
      } else {
        logger.warn('nextCampaign not available for event tracking');
      }
    } catch (error) {
      logger.error(`Failed to track event ${eventName}:`, error);
    }
  }

  /**
   * Tracks a page view event
   */
  public async trackPageView(): Promise<void> {
    const pageData = {
      title: document.title,
      url: window.location.href
    };

    await this.trackEvent('page_view', pageData);
  }

  /**
   * Check if analytics SDK is loaded
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Check if analytics SDK is currently loading
   */
  public isLoading(): boolean {
    return this.loading;
  }
}

// Export singleton instance
export const analyticsManager = AnalyticsManager.getInstance();