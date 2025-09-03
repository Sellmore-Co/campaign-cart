/**
 * Attribution Collector - Collects attribution data from various sources
 */

import type { AttributionState, AttributionMetadata } from '@/stores/attributionStore';
import { createLogger } from '@/utils/logger';

const logger = createLogger('AttributionCollector');

export class AttributionCollector {
  /**
   * Collect attribution data from all available sources
   */
  async collect(): Promise<AttributionState> {
    const metadata = this.collectMetadata();
    
    return {
      // Core attribution fields
      affiliate: this.getStoredValue('affid') || this.getStoredValue('aff') || '',
      funnel: this.getFunnelName(),
      gclid: this.getStoredValue('gclid') || '',
      
      // UTM parameters
      utm_source: this.getStoredValue('utm_source') || '',
      utm_medium: this.getStoredValue('utm_medium') || '',
      utm_campaign: this.getStoredValue('utm_campaign') || '',
      utm_content: this.getStoredValue('utm_content') || '',
      utm_term: this.getStoredValue('utm_term') || '',
      
      // Subaffiliates - limited to 225 characters to prevent API errors
      subaffiliate1: this.limitSubaffiliateLength(this.getStoredValue('subaffiliate1') || this.getStoredValue('sub1')),
      subaffiliate2: this.limitSubaffiliateLength(this.getStoredValue('subaffiliate2') || this.getStoredValue('sub2')),
      subaffiliate3: this.limitSubaffiliateLength(this.getStoredValue('subaffiliate3') || this.getStoredValue('sub3')),
      subaffiliate4: this.limitSubaffiliateLength(this.getStoredValue('subaffiliate4') || this.getStoredValue('sub4')),
      subaffiliate5: this.limitSubaffiliateLength(this.getStoredValue('subaffiliate5') || this.getStoredValue('sub5')),
      
      // Metadata
      metadata,
      
      // Timestamps
      first_visit_timestamp: this.getFirstVisitTimestamp(),
      current_visit_timestamp: Date.now()
    };
  }
  
  /**
   * Collect metadata including device info, referrer, and tracking data
   */
  private collectMetadata(): AttributionMetadata {
    const metadata: AttributionMetadata = {
      landing_page: window.location.href,
      referrer: document.referrer || '',
      device: navigator.userAgent || '',
      device_type: this.getDeviceType(),
      domain: window.location.hostname,
      timestamp: Date.now(),
      
      // Facebook tracking
      fb_fbp: this.getCookie('_fbp') || '',
      fb_fbc: this.getCookie('_fbc') || '',
      fb_pixel_id: this.getFacebookPixelId()
    };
    
    // Add fbclid if exists
    const fbclid = this.getStoredValue('fbclid');
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    
    // Add generic clickid if exists (for various tracking platforms)
    const clickid = this.getStoredValue('clickid');
    if (clickid) {
      metadata.clickid = clickid;
    }
    
    // Handle Everflow tracking
    this.handleEverflowClickId(metadata);
    
    // Collect custom tracking tags
    this.collectTrackingTags(metadata);
    
    return metadata;
  }
  
  /**
   * Limit subaffiliate value to 225 characters to prevent API errors
   */
  private limitSubaffiliateLength(value: string): string {
    if (!value) {
      return '';
    }
    
    if (value.length > 225) {
      logger.warn(`Subaffiliate value truncated from ${value.length} to 225 characters`);
      return value.substring(0, 225);
    }
    
    return value;
  }
  
  /**
   * Get value from URL parameters, sessionStorage, or localStorage
   * Priority: URL > sessionStorage > localStorage
   */
  private getStoredValue(key: string): string {
    // Try URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      const value = urlParams.get(key) || '';
      
      // Store in sessionStorage for persistence during session
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        console.error(`[AttributionCollector] Error storing ${key} in sessionStorage:`, error);
      }
      
      return value;
    }
    
    // Try sessionStorage
    try {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        return sessionValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from sessionStorage:`, error);
    }
    
    // Try localStorage
    try {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        return localValue;
      }
    } catch (error) {
      console.error(`[AttributionCollector] Error reading ${key} from localStorage:`, error);
    }
    
    // Try persisted attribution data
    try {
      const persistedData = localStorage.getItem('next-attribution');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state[key]) {
          return parsed.state[key];
        }
      }
    } catch (error) {
      console.error('[AttributionCollector] Error reading persisted attribution:', error);
    }
    
    return '';
  }
  
  /**
   * Get cookie value by name
   */
  private getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || '';
    }
    return '';
  }
  
  /**
   * Detect device type based on user agent
   */
  private getDeviceType(): 'mobile' | 'desktop' {
    const userAgent = navigator.userAgent;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
  }
  
  /**
   * Get funnel name from meta tag or campaign
   * Once a funnel is set, it persists and won't be overwritten
   */
  private getFunnelName(): string {
    // First check if we already have a persisted funnel name
    try {
      // Check sessionStorage first (current session)
      const sessionFunnel = sessionStorage.getItem('next_funnel_name');
      if (sessionFunnel) {
        logger.debug(`Using persisted funnel from session: ${sessionFunnel}`);
        return sessionFunnel;
      }
      
      // Check localStorage (cross-session)
      const localFunnel = localStorage.getItem('next_funnel_name');
      if (localFunnel) {
        logger.debug(`Using persisted funnel from localStorage: ${localFunnel}`);
        // Also set in sessionStorage for consistency
        sessionStorage.setItem('next_funnel_name', localFunnel);
        return localFunnel;
      }
      
      // Check persisted attribution data
      const persistedData = localStorage.getItem('next-attribution');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.funnel) {
          logger.debug(`Using persisted funnel from attribution: ${parsed.state.funnel}`);
          // Also set in session/localStorage for faster access
          sessionStorage.setItem('next_funnel_name', parsed.state.funnel);
          localStorage.setItem('next_funnel_name', parsed.state.funnel);
          return parsed.state.funnel;
        }
      }
    } catch (error) {
      console.error('[AttributionCollector] Error reading persisted funnel:', error);
    }
    
    // No persisted funnel found, check for meta tag
    const funnelMetaTag = document.querySelector(
      'meta[name="os-tracking-tag"][data-tag-name="funnel_name"], ' +
      'meta[name="data-next-tracking-tag"][data-tag-name="funnel_name"], ' +
      'meta[name="next-funnel"]'
    );
    
    if (funnelMetaTag) {
      const value = funnelMetaTag.getAttribute('data-tag-value') || 
                    funnelMetaTag.getAttribute('content');
      if (value) {
        logger.debug(`New funnel found from meta tag: ${value}`);
        // Persist the funnel name
        try {
          sessionStorage.setItem('next_funnel_name', value);
          localStorage.setItem('next_funnel_name', value);
          logger.info(`Persisted funnel name: ${value}`);
        } catch (error) {
          console.error('[AttributionCollector] Error persisting funnel name:', error);
        }
        return value;
      }
    }
    
    // Return empty - will be set when campaign loads or from meta tag
    return '';
  }
  
  /**
   * Handle Everflow click ID tracking
   */
  private handleEverflowClickId(metadata: AttributionMetadata): void {
    const urlParams = new URLSearchParams(window.location.search);
    let evclid = localStorage.getItem('evclid');
    
    // Check URL parameters first
    if (urlParams.has('evclid')) {
      evclid = urlParams.get('evclid') || '';
      localStorage.setItem('evclid', evclid);
      sessionStorage.setItem('evclid', evclid);
      logger.debug(`Everflow click ID found in URL: ${evclid}`);
    } 
    // Try sessionStorage as fallback
    else if (!evclid && sessionStorage.getItem('evclid')) {
      evclid = sessionStorage.getItem('evclid');
      if (evclid) {
        localStorage.setItem('evclid', evclid);
        logger.debug(`Everflow click ID found in sessionStorage: ${evclid}`);
      }
    }
    
    // Handle sg_evclid separately
    if (urlParams.has('sg_evclid')) {
      const sg_evclid = urlParams.get('sg_evclid') || '';
      sessionStorage.setItem('sg_evclid', sg_evclid);
      localStorage.setItem('sg_evclid', sg_evclid);
      metadata.sg_evclid = sg_evclid;
      logger.debug(`SG Everflow click ID found: ${sg_evclid}`);
    } else {
      const storedSgEvclid = localStorage.getItem('sg_evclid');
      if (storedSgEvclid) {
        metadata.sg_evclid = storedSgEvclid;
      }
    }
    
    // Set the transaction ID in metadata if we have it
    if (evclid) {
      metadata.everflow_transaction_id = evclid;
      logger.debug(`Added Everflow transaction ID to metadata: ${evclid}`);
    }
  }
  
  /**
   * Collect custom tracking tags from meta elements
   */
  private collectTrackingTags(metadata: AttributionMetadata): void {
    // Support both old and new tag names
    const trackingTags = document.querySelectorAll(
      'meta[name="os-tracking-tag"], meta[name="data-next-tracking-tag"]'
    );
    
    logger.debug(`Found ${trackingTags.length} tracking tags`);
    
    trackingTags.forEach(tag => {
      const tagName = tag.getAttribute('data-tag-name');
      const tagValue = tag.getAttribute('data-tag-value');
      const shouldPersist = tag.getAttribute('data-persist') === 'true';
      
      if (tagName && tagValue) {
        metadata[tagName] = tagValue;
        logger.debug(`Added tracking tag: ${tagName} = ${tagValue}`);
        
        // Store in sessionStorage if it should persist
        if (shouldPersist) {
          try {
            sessionStorage.setItem(`tn_tag_${tagName}`, tagValue);
            logger.debug(`Persisted tracking tag: ${tagName}`);
          } catch (error) {
            console.error(`[AttributionCollector] Error persisting tag ${tagName}:`, error);
          }
        }
      }
    });
  }
  
  /**
   * Try to detect Facebook Pixel ID from the page
   */
  private getFacebookPixelId(): string {
    // Check for dedicated pixel meta tag (highest priority)
    const pixelMeta = document.querySelector(
      'meta[name="os-facebook-pixel"], meta[name="facebook-pixel-id"]'
    );
    
    if (pixelMeta) {
      const pixelId = pixelMeta.getAttribute('content');
      if (pixelId) {
        logger.debug(`Facebook Pixel ID found from meta tag: ${pixelId}`);
        return pixelId;
      }
    }
    
    // Try to find FB Pixel ID from script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('fbq(') && content.includes('init')) {
        const match = content.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
        if (match && match[1]) {
          logger.debug(`Facebook Pixel ID found from script: ${match[1]}`);
          return match[1];
        }
      }
    }
    
    return '';
  }
  
  /**
   * Get the first visit timestamp
   */
  private getFirstVisitTimestamp(): number {
    // Try to get from persisted attribution data
    try {
      const persistedData = localStorage.getItem('next-attribution');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        if (parsed.state && parsed.state.first_visit_timestamp) {
          return parsed.state.first_visit_timestamp;
        }
      }
    } catch (error) {
      console.error('[AttributionCollector] Error reading first visit timestamp:', error);
    }
    
    // Otherwise use current timestamp
    return Date.now();
  }
}