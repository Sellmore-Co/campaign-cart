/**
 * ListAttributionTracker - Tracks current list/collection page for attribution
 * Stores list context in sessionStorage for proper item attribution
 */

import { createLogger } from '@/utils/logger';

const logger = createLogger('ListAttributionTracker');

const STORAGE_KEY = 'analytics_current_list';
const LIST_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

interface ListContext {
  listId?: string;
  listName?: string;
  timestamp: number;
  url: string;
}

export class ListAttributionTracker {
  private static instance: ListAttributionTracker;
  private currentList: ListContext | null = null;

  private constructor() {
    this.loadFromStorage();
    this.setupUrlTracking();
  }

  public static getInstance(): ListAttributionTracker {
    if (!ListAttributionTracker.instance) {
      ListAttributionTracker.instance = new ListAttributionTracker();
    }
    return ListAttributionTracker.instance;
  }

  /**
   * Initialize the tracker (called by NextAnalytics)
   */
  public initialize(): void {
    // Already initialized in constructor, but this method is called by NextAnalytics
    logger.debug('ListAttributionTracker initialized');
  }

  /**
   * Set the current list context
   */
  public setCurrentList(listId?: string, listName?: string): void {
    const context: ListContext = {
      ...(listId !== undefined && { listId }),
      ...(listName !== undefined && { listName }),
      timestamp: Date.now(),
      url: window.location.href
    };

    this.currentList = context;
    this.saveToStorage();

    logger.debug('Set current list:', { listId, listName });
  }

  /**
   * Get the current list context if still valid
   */
  public getCurrentList(): { listId?: string; listName?: string } | null {
    if (!this.currentList) {
      return null;
    }

    // Check if list context is expired
    if (Date.now() - this.currentList.timestamp > LIST_EXPIRY_MS) {
      logger.debug('List context expired');
      this.clearCurrentList();
      return null;
    }

    return {
      ...(this.currentList.listId !== undefined && { listId: this.currentList.listId }),
      ...(this.currentList.listName !== undefined && { listName: this.currentList.listName })
    };
  }

  /**
   * Clear the current list context
   */
  public clearCurrentList(): void {
    this.currentList = null;
    this.removeFromStorage();
    logger.debug('Cleared current list');
  }

  /**
   * Reset the tracker (called by NextAnalytics)
   */
  public reset(): void {
    this.clearCurrentList();
    logger.debug('ListAttributionTracker reset');
  }

  /**
   * Detect list from URL patterns
   */
  public detectListFromUrl(url?: string): { listId?: string; listName?: string } | null {
    const targetUrl = url || window.location.href;
    const urlObj = new URL(targetUrl, window.location.origin);
    const pathname = urlObj.pathname.toLowerCase();

    // Common e-commerce URL patterns
    const patterns = [
      // Collection pages
      { regex: /\/collections?\/([^\/]+)/, type: 'collection' },
      // Category pages
      { regex: /\/category\/([^\/]+)/, type: 'category' },
      { regex: /\/categories\/([^\/]+)/, type: 'category' },
      // Product list pages
      { regex: /\/products\/?$/, type: 'all_products' },
      { regex: /\/shop\/?$/, type: 'shop' },
      { regex: /\/store\/?$/, type: 'store' },
      // Search results
      { regex: /\/search/, type: 'search' },
      // Tag pages
      { regex: /\/tag\/([^\/]+)/, type: 'tag' },
      { regex: /\/tags\/([^\/]+)/, type: 'tag' },
      // Brand pages
      { regex: /\/brand\/([^\/]+)/, type: 'brand' },
      { regex: /\/brands\/([^\/]+)/, type: 'brand' }
    ];

    for (const pattern of patterns) {
      const match = pathname.match(pattern.regex);
      if (match) {
        const listId = match[1] || pattern.type;
        const listName = this.formatListName(listId, pattern.type);
        
        logger.debug('Detected list from URL:', { listId, listName, type: pattern.type });
        return { listId, listName };
      }
    }

    // Check for query parameters that might indicate a list
    const searchParams = urlObj.searchParams;
    if (searchParams.has('category')) {
      const category = searchParams.get('category')!;
      return { 
        listId: category, 
        listName: this.formatListName(category, 'category') 
      };
    }

    if (searchParams.has('collection')) {
      const collection = searchParams.get('collection')!;
      return { 
        listId: collection, 
        listName: this.formatListName(collection, 'collection') 
      };
    }

    if (searchParams.has('q') || searchParams.has('query') || searchParams.has('search')) {
      const query = searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || '';
      return { 
        listId: 'search_results', 
        listName: `Search Results: ${query}` 
      };
    }

    return null;
  }

  /**
   * Automatically track list changes based on URL
   */
  private setupUrlTracking(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Track on initial load
    this.trackCurrentUrl();

    // Track on popstate (browser back/forward)
    window.addEventListener('popstate', () => {
      this.trackCurrentUrl();
    });

    // Track on pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => ListAttributionTracker.getInstance().trackCurrentUrl(), 0);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => ListAttributionTracker.getInstance().trackCurrentUrl(), 0);
    };
  }

  /**
   * Track the current URL for list context
   */
  private trackCurrentUrl(): void {
    const detected = this.detectListFromUrl();
    if (detected) {
      this.setCurrentList(detected.listId, detected.listName);
    } else {
      // Clear list context if not on a list page
      const currentUrl = window.location.pathname.toLowerCase();
      if (!this.isProductPage(currentUrl)) {
        this.clearCurrentList();
      }
    }
  }

  /**
   * Check if URL is a product page (should preserve list context)
   */
  private isProductPage(pathname: string): boolean {
    const productPatterns = [
      /\/product\/[^\/]+/,
      /\/products\/[^\/]+/,
      /\/item\/[^\/]+/,
      /\/p\/[^\/]+/
    ];

    return productPatterns.some(pattern => pattern.test(pathname));
  }

  /**
   * Format list name from ID
   */
  private formatListName(listId: string, type: string): string {
    // Clean up the list ID
    const cleaned = listId
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    switch (type) {
      case 'collection':
        return `${cleaned} Collection`;
      case 'category':
        return `${cleaned} Category`;
      case 'all_products':
        return 'All Products';
      case 'shop':
        return 'Shop';
      case 'store':
        return 'Store';
      case 'search':
        return 'Search Results';
      case 'tag':
        return `Tag: ${cleaned}`;
      case 'brand':
        return `${cleaned} Brand`;
      default:
        return cleaned;
    }
  }

  /**
   * Load list context from storage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const context = JSON.parse(stored) as ListContext;
        
        // Check if context is still valid
        if (Date.now() - context.timestamp < LIST_EXPIRY_MS) {
          this.currentList = context;
          logger.debug('Loaded list context from storage:', context);
        } else {
          this.removeFromStorage();
        }
      }
    } catch (error) {
      logger.error('Error loading list context from storage:', error);
    }
  }

  /**
   * Save list context to storage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined' || !window.sessionStorage || !this.currentList) {
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentList));
    } catch (error) {
      logger.error('Error saving list context to storage:', error);
    }
  }

  /**
   * Remove list context from storage
   */
  private removeFromStorage(): void {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return;
    }

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logger.error('Error removing list context from storage:', error);
    }
  }
}

// Export singleton instance
export const listAttributionTracker = ListAttributionTracker.getInstance();