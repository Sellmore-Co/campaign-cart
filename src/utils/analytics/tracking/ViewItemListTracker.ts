/**
 * ViewItemListTracker - Automatically tracks product views on pages
 * Scans for elements with data-next-package-id and fires appropriate events
 */

import { createLogger } from '@/utils/logger';
import { useCampaignStore } from '@/stores/campaignStore';
import { dataLayer } from '../DataLayerManager';
import { listAttributionTracker } from './ListAttributionTracker';

const logger = createLogger('ViewItemListTracker');

interface TrackedProduct {
  packageId: string;
  element: Element;
  index: number;
}

export class ViewItemListTracker {
  private static instance: ViewItemListTracker;
  private observer: MutationObserver | null = null;
  private trackedProducts = new Set<string>();
  private lastScanTime = 0;
  private scanDebounceMs = 500;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ViewItemListTracker {
    if (!ViewItemListTracker.instance) {
      ViewItemListTracker.instance = new ViewItemListTracker();
    }
    return ViewItemListTracker.instance;
  }

  /**
   * Initialize the tracker
   */
  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.isInitialized = true;
    dataLayer.initialize();

    // Initial scan after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.scan());
    } else {
      // Small delay to ensure elements are rendered
      setTimeout(() => this.scan(), 100);
    }

    // Set up mutation observer for dynamic content
    this.setupObserver();

    logger.info('ViewItemListTracker initialized');
  }

  /**
   * Scan the page for products and fire appropriate events
   */
  public scan(): void {
    const now = Date.now();
    if (now - this.lastScanTime < this.scanDebounceMs) {
      logger.debug('Scan debounced (too soon after last scan)');
      return;
    }
    this.lastScanTime = now;

    const products = this.findProductElements();
    
    if (products.length === 0) {
      logger.debug('No products found on page');
      return;
    }

    logger.debug(`Found ${products.length} products on page`);

    if (products.length === 1) {
      // Single product - fire view_item event
      const product = products[0];
      if (product) {
        this.trackViewItem(product);
      }
    } else {
      // Multiple products - fire view_item_list event
      this.trackViewItemList(products);
    }
  }

  /**
   * Rescan the page (public method for manual triggering)
   */
  public rescan(): void {
    logger.debug('Manual rescan triggered');
    this.trackedProducts.clear();
    this.scan();
  }

  /**
   * Find all product elements on the page
   */
  private findProductElements(): TrackedProduct[] {
    const elements = document.querySelectorAll('[data-next-package-id]');
    const products: TrackedProduct[] = [];
    const seen = new Set<string>();

    elements.forEach((element, index) => {
      const packageId = element.getAttribute('data-next-package-id');
      if (packageId && !seen.has(packageId)) {
        seen.add(packageId);
        products.push({
          packageId,
          element,
          index
        });
      }
    });

    return products;
  }

  /**
   * Track a single product view
   */
  private trackViewItem(product: TrackedProduct): void {
    if (this.trackedProducts.has(product.packageId)) {
      logger.debug('Product already tracked:', product.packageId);
      return;
    }

    const campaignStore = useCampaignStore.getState();
    
    // Debug: Check if campaign data is loaded
    if (!campaignStore.data || !campaignStore.packages || campaignStore.packages.length === 0) {
      logger.debug('Campaign data not yet loaded, deferring tracking');
      // Retry after a short delay
      setTimeout(() => this.scan(), 1000);
      return;
    }
    // Convert packageId to number if needed
    const packageIdNum = parseInt(product.packageId, 10);
    const packageData = !isNaN(packageIdNum) ? campaignStore.getPackage(packageIdNum) : null;

    if (!packageData) {
      logger.warn('Package not found in store:', product.packageId);
      return;
    }

    // Get list context for attribution
    const listContext = listAttributionTracker.getCurrentList();

    const item = {
      item_id: packageData.external_id.toString(), // Use external_id for analytics
      item_name: packageData.name || `Package ${product.packageId}`,
      currency: campaignStore.data?.currency || 'USD',
      price: parseFloat(packageData.price_total || '0'), // Use total package price
      quantity: 1, // Always 1 for package-based pricing
      item_category: 'uncategorized',
      item_variant: undefined,
      ...(listContext && {
        item_list_id: listContext.listId,
        item_list_name: listContext.listName
      })
    };

    const event = dataLayer.formatEcommerceEvent('dl_view_item', {
      currency: item.currency,
      value: item.price,
      items: [item]
    });

    dataLayer.push(event);
    this.trackedProducts.add(product.packageId);

    logger.info('Tracked view_item:', product.packageId);
  }

  /**
   * Track multiple products view
   */
  private trackViewItemList(products: TrackedProduct[]): void {
    const campaignStore = useCampaignStore.getState();
    const items: any[] = [];
    let totalValue = 0;
    
    // Debug: Check if campaign data is loaded
    if (!campaignStore.data || !campaignStore.packages || campaignStore.packages.length === 0) {
      logger.debug('Campaign data not yet loaded, deferring tracking');
      // Retry after a short delay
      setTimeout(() => this.scan(), 1000);
      return;
    }

    // Get list context
    const listContext = listAttributionTracker.getCurrentList() || 
                       listAttributionTracker.detectListFromUrl() ||
                       { listId: 'product_list', listName: 'Product List' };

    products.forEach((product, index) => {
      if (this.trackedProducts.has(product.packageId)) {
        return; // Skip already tracked products
      }

      // Convert packageId to number if needed
      const packageIdNum = parseInt(product.packageId, 10);
      const packageData = !isNaN(packageIdNum) ? campaignStore.getPackage(packageIdNum) : null;
      
      if (!packageData) {
        logger.warn('Package not found in store:', product.packageId);
        return;
      }

      const price = parseFloat(packageData.price_total || '0'); // Use total package price
      totalValue += price;

      items.push({
        item_id: packageData.external_id.toString(), // Use external_id for analytics
        item_name: packageData.name || `Package ${product.packageId}`,
        currency: campaignStore.data?.currency || 'USD',
        price: price,
        quantity: 1, // Always 1 for package-based pricing
        item_category: 'uncategorized',
        item_variant: undefined,
        item_list_id: listContext.listId,
        item_list_name: listContext.listName,
        index: index
      });

      this.trackedProducts.add(product.packageId);
    });

    if (items.length === 0) {
      logger.debug('No new products to track');
      return;
    }

    const event = dataLayer.formatEcommerceEvent('dl_view_item_list', {
      currency: campaignStore.data?.currency || 'USD',
      value: totalValue,
      items: items,
      item_list_id: listContext.listId,
      item_list_name: listContext.listName
    });

    dataLayer.push(event);

    logger.info(`Tracked view_item_list with ${items.length} items`);
  }

  /**
   * Set up mutation observer for dynamic content
   */
  private setupObserver(): void {
    if (typeof window === 'undefined' || !window.MutationObserver) {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      let hasRelevantChanges = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // Check if any added nodes contain product elements
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node && node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.hasAttribute('data-next-package-id') ||
                  element.querySelector('[data-next-package-id]')) {
                hasRelevantChanges = true;
                break;
              }
            }
          }
        } else if (mutation.type === 'attributes' && 
                   mutation.attributeName === 'data-next-package-id') {
          hasRelevantChanges = true;
        }

        if (hasRelevantChanges) {
          break;
        }
      }

      if (hasRelevantChanges) {
        logger.debug('Detected DOM changes with products');
        this.scan();
      }
    });

    // Observe the entire document for changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-next-package-id']
    });

    logger.debug('Mutation observer set up');
  }

  /**
   * Reset the tracker (for route changes)
   */
  public reset(): void {
    this.trackedProducts.clear();
    logger.debug('ViewItemListTracker reset');
    // Re-scan for products on the new page
    if (this.isInitialized) {
      this.scan();
    }
  }

  /**
   * Clean up the tracker
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.trackedProducts.clear();
    this.isInitialized = false;
    logger.debug('ViewItemListTracker destroyed');
  }

  /**
   * Get tracking status
   */
  public getStatus(): {
    initialized: boolean;
    trackedCount: number;
    observing: boolean;
  } {
    return {
      initialized: this.isInitialized,
      trackedCount: this.trackedProducts.size,
      observing: this.observer !== null
    };
  }
}

// Export singleton instance
export const viewItemListTracker = ViewItemListTracker.getInstance();