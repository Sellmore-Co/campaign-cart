/**
 * UTM Transfer Utility
 * Automatically adds current URL parameters to all links on the page
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('UtmTransfer');

export interface UtmTransferConfig {
  enabled: boolean;
  applyToExternalLinks?: boolean;
  excludedDomains?: string[];
  paramsToCopy?: string[];
  debug?: boolean;
}

export class UtmTransfer {
  private config: UtmTransferConfig;
  private paramsToApply: URLSearchParams;
  
  constructor(config: Partial<UtmTransferConfig> = {}) {
    this.config = {
      enabled: true,
      applyToExternalLinks: false,
      excludedDomains: [],
      paramsToCopy: [],
      debug: false,
      ...config
    };
    
    this.paramsToApply = new URLSearchParams();
  }
  
  /**
   * Initialize the UTM transfer feature
   */
  public init(): void {
    if (!this.config.enabled) {
      logger.debug('UTM Transfer disabled by configuration');
      return;
    }
    
    // Get current URL parameters
    const currentParams = new URLSearchParams(window.location.search);
    
    // Skip if no parameters exist
    if (currentParams.toString() === '') {
      logger.debug('No URL parameters to transfer');
      return;
    }
    
    // Log available parameters
    if (this.config.debug) {
      const availableParams: string[] = [];
      currentParams.forEach((value, key) => {
        availableParams.push(`${key}=${value}`);
      });
      logger.debug(`Available parameters: ${availableParams.join(', ')}`);
    }
    
    // Filter parameters if specific ones are specified
    this.prepareParameters(currentParams);
    
    if (this.paramsToApply.toString() === '') {
      logger.debug('No matching parameters to transfer');
      return;
    }
    
    // Set up link enhancement
    this.enhanceLinks();
    
    // Watch for new links added to the DOM
    this.observeNewLinks();
    
    logger.debug(`UTM Transfer initialized with parameters: ${this.paramsToApply.toString()}`);
  }
  
  /**
   * Prepare parameters to apply based on configuration
   */
  private prepareParameters(currentParams: URLSearchParams): void {
    if (Array.isArray(this.config.paramsToCopy) && this.config.paramsToCopy.length > 0) {
      // Only copy specific parameters
      logger.debug(`Filtering to specific parameters: ${this.config.paramsToCopy.join(', ')}`);
      
      this.config.paramsToCopy.forEach(param => {
        if (currentParams.has(param)) {
          this.paramsToApply.append(param, currentParams.get(param)!);
          logger.debug(`Found parameter to copy: ${param}=${currentParams.get(param)}`);
        }
      });
    } else {
      // Copy all parameters
      logger.debug('No specific parameters configured, will copy all parameters');
      currentParams.forEach((value, key) => {
        this.paramsToApply.append(key, value);
      });
    }
  }
  
  /**
   * Enhance all existing links on the page
   */
  private enhanceLinks(): void {
    const links = document.querySelectorAll('a');
    logger.debug(`Found ${links.length} links on the page`);
    
    links.forEach(link => {
      this.addClickListener(link);
    });
  }
  
  /**
   * Add click listener to a link
   */
  private addClickListener(link: HTMLAnchorElement): void {
    // Mark link as enhanced to avoid duplicate listeners
    if (link.dataset.utmEnhanced === 'true') {
      return;
    }
    
    link.addEventListener('click', (_event) => {
      this.applyParamsToLink(link);
    });
    
    link.dataset.utmEnhanced = 'true';
  }
  
  /**
   * Apply parameters to a specific link
   */
  public applyParamsToLink(linkElement: HTMLAnchorElement): void {
    if (!linkElement || !linkElement.getAttribute) {
      logger.error('Invalid link element provided');
      return;
    }
    
    // Get the href attribute
    const href = linkElement.getAttribute('href');
    if (!href) return;
    
    // Skip special links
    if (this.shouldSkipLink(href)) {
      return;
    }
    
    // Handle external links
    if (this.isExternalLink(href)) {
      if (!this.config.applyToExternalLinks) {
        return;
      }
      
      // Check excluded domains
      if (this.isExcludedDomain(href)) {
        return;
      }
    }
    
    // Parse the link's URL
    let url: URL;
    try {
      // Handle relative URLs
      url = new URL(href, window.location.origin);
    } catch (e) {
      logger.error('Invalid URL:', href);
      return;
    }
    
    // Get existing parameters in the link
    const linkParams = new URLSearchParams(url.search);
    
    // Add current page parameters without overriding existing ones
    let paramsAdded = false;
    this.paramsToApply.forEach((value, key) => {
      if (!linkParams.has(key)) {
        linkParams.append(key, value);
        paramsAdded = true;
      }
    });
    
    // Only update if we actually added parameters
    if (paramsAdded) {
      // Update the link's search parameters
      url.search = linkParams.toString();
      
      // Update the href attribute
      linkElement.setAttribute('href', url.toString());
      
      logger.debug(`Updated link ${href} to ${url.toString()}`);
    }
  }
  
  /**
   * Check if link should be skipped
   */
  private shouldSkipLink(href: string): boolean {
    return href.startsWith('#') || 
           href.startsWith('javascript:') || 
           href.startsWith('mailto:') || 
           href.startsWith('tel:') ||
           href.startsWith('sms:') ||
           href.startsWith('whatsapp:');
  }
  
  /**
   * Check if link is external
   */
  private isExternalLink(href: string): boolean {
    return href.includes('://') && !href.includes(window.location.hostname);
  }
  
  /**
   * Check if domain is excluded
   */
  private isExcludedDomain(href: string): boolean {
    if (!this.config.excludedDomains || this.config.excludedDomains.length === 0) {
      return false;
    }
    
    return this.config.excludedDomains.some(domain => href.includes(domain));
  }
  
  /**
   * Observe DOM for new links
   */
  private observeNewLinks(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added node is a link
            if (element.tagName === 'A') {
              this.addClickListener(element as HTMLAnchorElement);
            }
            
            // Check for links within the added node
            const links = element.querySelectorAll('a');
            links.forEach(link => {
              this.addClickListener(link as HTMLAnchorElement);
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  
  /**
   * Get current configuration
   */
  public getConfig(): UtmTransferConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  public updateConfig(config: Partial<UtmTransferConfig>): void {
    this.config = { ...this.config, ...config };
  }
}