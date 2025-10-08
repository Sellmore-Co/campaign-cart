/**
 * Attribute Scanner
 * Scans DOM for data attributes and instantiates appropriate enhancers
 * 
 * Memory Management:
 * - Uses WeakMap for automatic garbage collection of enhancers
 * - Elements removed from DOM will have their enhancers cleaned up automatically
 * - Tracks enhancer count separately since WeakMap doesn't support .size
 * 
 * Performance:
 * - Batch processing with yield between batches
 * - Debounced queue processing
 * - DOM observation for dynamic content
 */

import { Logger, createLogger } from '@/utils/logger';
import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { AttributeParser } from '@/enhancers/base/AttributeParser';
import { DOMObserver, type DOMChangeEvent } from '@/enhancers/base/DOMObserver';

export class AttributeScanner {
  private logger: Logger;
  private enhancers = new WeakMap<HTMLElement, BaseEnhancer[]>();
  private enhancerCount = 0; // Track count separately since WeakMap doesn't have .size
  private domObserver: DOMObserver;
  private isScanning = false;
  private scanQueue = new Set<HTMLElement>();
  private enhancerStats = new Map<string, { totalTime: number; count: number }>();
  private isDebugMode = false;

  constructor() {
    this.logger = createLogger('AttributeScanner');
    this.domObserver = new DOMObserver();
    this.domObserver.addHandler(this.handleDOMChange.bind(this));
    
    // Check if debug mode is enabled
    this.isDebugMode = new URLSearchParams(location.search).get('debug') === 'true';
    
    if (this.isDebugMode) {
      console.log('🐛 AttributeScanner: Debug mode enabled for performance tracking');
    }
  }

  public async scanAndEnhance(root: Element): Promise<void> {
    if (this.isScanning) {
      this.logger.warn('Already scanning, queuing request');
      return;
    }

    this.isScanning = true;
    this.logger.info('🔍 Starting DOM scan for data attributes...', { root: root.tagName });
    
    try {
      // Find all elements with data-next attributes
      const selector = [
        '[data-next-enhancer]',  // Generic enhancer (checkout-review, etc.)
        '[data-next-display]',
        '[data-next-toggle]',
        '[data-next-action]',
        '[data-next-timer]',
        '[data-next-show]',
        '[data-next-hide]',
        '[data-next-show-if-profile]',
        '[data-next-hide-if-profile]',
        'form[data-next-checkout]',
        '[data-next-express-checkout]',
        '[data-next-timer-display]',
        '[data-next-timer-expired]',
        '[data-next-cart-items]',
        '[data-next-order-items]',
        '[data-next-quantity="increase"]',
        '[data-next-quantity="decrease"]',
        '[data-next-quantity="set"]',
        '[data-next-remove-item]',
        '[data-next-selector]',
        '[data-next-selector-id]',
        '[data-next-cart-selector]',
        '[data-next-upsell]',
        '[data-next-upsell-selector]',
        '[data-next-upsell-select]',
        '[data-next-coupon="input"]',
        '[data-next-coupon=""]',
        '[data-next-accordion]',
        '[data-next-tooltip]',
        '[data-next-express-checkout="container"]',
        '[data-next-component="scroll-hint"]',
        '[data-next-quantity-text]',
        '[data-next-profile]',
        'select[data-next-profile-selector]'
      ].join(', ');
      
      const elements = root.querySelectorAll(selector);

      this.logger.debug(`Found ${elements.length} elements with data attributes`);

      // Log conditional display elements specifically
      const conditionalElements = root.querySelectorAll('[data-next-show], [data-next-hide]');
      if (conditionalElements.length > 0) {
        this.logger.info(`Found ${conditionalElements.length} conditional display elements:`,
          Array.from(conditionalElements).map(el => ({
            tag: el.tagName,
            class: el.className,
            show: el.getAttribute('data-next-show'),
            hide: el.getAttribute('data-next-hide')
          }))
        );
      }
      
      let enhancedCount = 0;
      const enhancePromises: Promise<void>[] = [];
      
      // Process elements in batches to avoid blocking
      const batchSize = 10;
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = Array.from(elements).slice(i, i + batchSize);
        
        for (const element of batch) {
          if (element instanceof HTMLElement) {
            enhancePromises.push(
              this.enhanceElement(element).then(() => {
                enhancedCount++;
              })
            );
          }
        }
        
        // Process batch and yield control
        await Promise.all(enhancePromises.splice(0, batchSize));
        
        // Yield control to prevent blocking
        if (i + batchSize < elements.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Wait for any remaining promises
      await Promise.all(enhancePromises);
      
      this.logger.debug(`Enhanced ${enhancedCount} elements successfully`);
      
      // Show performance report in debug mode
      if (this.isDebugMode && this.enhancerStats.size > 0) {
        this.showPerformanceReport();
      }
      
      // Add class to HTML element to indicate display is finished
      document.documentElement.classList.add('next-display-ready');
      this.logger.debug('Added next-display-ready class to HTML element');
      
      // Dispatch custom event for additional flexibility
      window.dispatchEvent(new CustomEvent('next:display-ready', {
        detail: {
          enhancedCount,
          root: root.tagName
        }
      }));
      
      // Start observing for dynamic content
      this.startObserving(root);
      
    } catch (error) {
      this.logger.error('Error during scan and enhance:', error);
    } finally {
      this.isScanning = false;
    }
  }

  private async enhanceElement(element: HTMLElement): Promise<void> {
    // Skip if already enhanced
    if (this.enhancers.has(element)) {
      this.logger.debug('Element already enhanced, skipping', element);
      return;
    }

    // Skip elements inside cart items templates (they contain placeholder variables like {item.packageId})
    const cartItemsContainer = element.closest('[data-next-cart-items]');
    if (cartItemsContainer && cartItemsContainer !== element) {
      this.logger.debug('Skipping element inside cart items template', element);
      return;
    }

    // Skip elements with template variables (literal {item.packageId})
    const packageId = element.getAttribute('data-package-id');
    if (packageId && packageId.includes('{') && packageId.includes('}')) {
      this.logger.debug('Skipping element with template variable', element, packageId);
      return;
    }

    try {
      const enhancerTypes = AttributeParser.getEnhancerTypes(element);
      
      if (enhancerTypes.length === 0) {
        this.logger.debug('No enhancer types found for element', element);
        return;
      }

      const elementEnhancers: BaseEnhancer[] = [];
      
      for (const type of enhancerTypes) {
        const enhancer = await this.createEnhancer(type, element);
        if (enhancer) {
          elementEnhancers.push(enhancer);
          
          try {
            if (this.isDebugMode) {
              // console.log(`🔧 Starting ${type} enhancer...`, element);
              const enhancerStart = performance.now();
              await enhancer.initialize();
              const enhancerTime = performance.now() - enhancerStart;
              
              // Track performance stats
              this.updateEnhancerStats(type, enhancerTime);
              
              // console.log(`🔧 ${type}: ${enhancerTime.toFixed(2)}ms`, element);
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            } else {
              await enhancer.initialize();
              this.logger.debug(`Initialized ${type} enhancer for element`, element);
            }
          } catch (initError) {
            this.logger.error(`Failed to initialize ${type} enhancer:`, initError, element);
            enhancer.destroy();
          }
        }
      }
      
      if (elementEnhancers.length > 0) {
        this.enhancers.set(element, elementEnhancers);
        this.enhancerCount += elementEnhancers.length;
        this.logger.debug(`Enhanced element with ${elementEnhancers.length} enhancer(s)`, {
          element: element.tagName,
          types: enhancerTypes,
          attributes: Array.from(element.attributes).map(attr => attr.name)
        });
      }
    } catch (error) {
      this.logger.error('Failed to enhance element:', error, element);
    }
  }

  private async createEnhancer(type: string, element: HTMLElement): Promise<BaseEnhancer | null> {
    try {
      switch (type) {
        case 'display':
          // Determine if this is a cart display or product display
          const displayPath = element.getAttribute('data-next-display') || '';
          const parsed = AttributeParser.parseDisplayPath(displayPath);
          
          this.logger.debug(`Creating display enhancer for path: "${displayPath}"`, {
            parsed,
            element: element.tagName,
            elementHtml: element.outerHTML.substring(0, 200) + '...'
          });
          
          if (parsed.object === 'cart') {
            this.logger.debug('Using CartDisplayEnhancer');
            const { CartDisplayEnhancer } = await import('@/enhancers/display/CartDisplayEnhancer');
            return new CartDisplayEnhancer(element);
          } else if (parsed.object === 'selection') {
            this.logger.debug('Using SelectionDisplayEnhancer');
            const { SelectionDisplayEnhancer } = await import('@/enhancers/display/SelectionDisplayEnhancer');
            return new SelectionDisplayEnhancer(element);
          } else if (parsed.object === 'package' || parsed.object === 'campaign') {
            this.logger.debug('Using ProductDisplayEnhancer');
            const { ProductDisplayEnhancer } = await import('@/enhancers/display/ProductDisplayEnhancer');
            return new ProductDisplayEnhancer(element);
          } else if (parsed.object === 'order') {
            this.logger.debug('Using OrderDisplayEnhancer');
            const { OrderDisplayEnhancer } = await import('@/enhancers/display/OrderDisplayEnhancer');
            return new OrderDisplayEnhancer(element);
          } else if (parsed.object === 'shipping') {
            this.logger.debug('Using ShippingDisplayEnhancer');
            const { ShippingDisplayEnhancer } = await import('@/enhancers/display/ShippingDisplayEnhancer');
            return new ShippingDisplayEnhancer(element);
          } else {
            // Check for context-based package detection
            let currentElement: HTMLElement | null = element.parentElement;
            let hasPackageContext = false;
            
            while (currentElement && !hasPackageContext) {
              if (currentElement.hasAttribute('data-next-package-id') ||
                  currentElement.hasAttribute('data-next-package') ||
                  currentElement.hasAttribute('data-package-id')) {
                hasPackageContext = true;
              }
              currentElement = currentElement.parentElement;
            }
            
            if (hasPackageContext) {
              this.logger.debug(`Using ProductDisplayEnhancer (fallback with package context)`);
              const { ProductDisplayEnhancer } = await import('@/enhancers/display/ProductDisplayEnhancer');
              return new ProductDisplayEnhancer(element);
            } else {
              // Default to cart display
              this.logger.debug(`Using CartDisplayEnhancer (fallback without package context)`);
              const { CartDisplayEnhancer } = await import('@/enhancers/display/CartDisplayEnhancer');
              return new CartDisplayEnhancer(element);
            }
          }
          
        case 'toggle':
          const { CartToggleEnhancer } = await import('@/enhancers/cart/CartToggleEnhancer');
          return new CartToggleEnhancer(element);

        case 'action':
          // Determine which specific action enhancer to use
          const action = element.getAttribute('data-next-action');
          
          switch (action) {
            case 'add-to-cart':
              const { AddToCartEnhancer } = await import('@/enhancers/cart/AddToCartEnhancer');
              return new AddToCartEnhancer(element);
              
            case 'accept-upsell':
              const { AcceptUpsellEnhancer } = await import('@/enhancers/cart/AcceptUpsellEnhancer');
              return new AcceptUpsellEnhancer(element);
              
            default:
              this.logger.warn(`Unknown action type: ${action}`);
              return null;
          }

        case 'selector':
          const { PackageSelectorEnhancer } = await import('@/enhancers/cart/PackageSelectorEnhancer');
          return new PackageSelectorEnhancer(element);
          
        case 'timer':
          const { TimerEnhancer } = await import('@/enhancers/display/TimerEnhancer');
          return new TimerEnhancer(element);
          
        case 'conditional':
          this.logger.info('Creating ConditionalDisplayEnhancer for element:', {
            element: element.tagName,
            class: element.className,
            showAttr: element.getAttribute('data-next-show'),
            hideAttr: element.getAttribute('data-next-hide')
          });
          const { ConditionalDisplayEnhancer } = await import('@/enhancers/display/ConditionalDisplayEnhancer');
          return new ConditionalDisplayEnhancer(element);
          
        case 'checkout':
          // SIMPLIFIED: Use single CheckoutFormEnhancer for all checkout functionality
          // This matches the original CheckoutFormEnhancer.backup.ts approach
          const { CheckoutFormEnhancer } = await import('@/enhancers/checkout/CheckoutFormEnhancer');
          return new CheckoutFormEnhancer(element);

        case 'checkout-review':
          this.logger.info('Creating CheckoutReviewEnhancer for element:', {
            element: element.tagName,
            class: element.className,
          });
          const { CheckoutReviewEnhancer } = await import('@/enhancers/checkout/CheckoutReviewEnhancer');
          return new CheckoutReviewEnhancer(element);

        case 'express-checkout':
          // This is for individual button elements (paypal, apple_pay, google_pay)
          // Currently we don't have a separate enhancer for these, they're managed by the container
          this.logger.debug('Skipping individual express checkout button - managed by container');
          return null;
          
        case 'express-checkout-container':
          const { ExpressCheckoutContainerEnhancer } = await import('@/enhancers/checkout/ExpressCheckoutContainerEnhancer');
          return new ExpressCheckoutContainerEnhancer(element);

        // REMOVED: form-validator, payment, address, phone, validation enhancers
        // These are now handled by the main CheckoutFormEnhancer (simplified approach)
          
        case 'cart-items':
          const { CartItemListEnhancer } = await import('@/enhancers/cart/CartItemListEnhancer');
          return new CartItemListEnhancer(element);

        case 'order-items':
          const { OrderItemListEnhancer } = await import('@/enhancers/order/OrderItemListEnhancer');
          return new OrderItemListEnhancer(element);

        case 'quantity':
          const { QuantityControlEnhancer } = await import('@/enhancers/cart/QuantityControlEnhancer');
          return new QuantityControlEnhancer(element);

        case 'remove-item':
          const { RemoveItemEnhancer } = await import('@/enhancers/cart/RemoveItemEnhancer');
          return new RemoveItemEnhancer(element);

        // 'order' case removed - order display now handled via data-next-display="order.xxx" pattern

        case 'upsell':
          const { UpsellEnhancer } = await import('@/enhancers/order/UpsellEnhancer');
          return new UpsellEnhancer(element);

        case 'coupon':
          const { CouponEnhancer } = await import('@/enhancers/CouponEnhancer');
          return new CouponEnhancer(element);

        case 'accordion':
          const { AccordionEnhancer } = await import('@/enhancers/ui/AccordionEnhancer');
          return new AccordionEnhancer(element);

        case 'tooltip':
          const { TooltipEnhancer } = await import('@/enhancers/ui/TooltipEnhancer');
          return new TooltipEnhancer(element);

        case 'scroll-hint':
          const { ScrollHintEnhancer } = await import('@/enhancers/ui/ScrollHintEnhancer');
          return new ScrollHintEnhancer(element);
        
        case 'quantity-text':
          const { QuantityTextEnhancer } = await import('@/enhancers/display/QuantityTextEnhancer');
          return new QuantityTextEnhancer(element);
        
        case 'profile-switcher':
          const { ProfileSwitcherEnhancer } = await import('@/enhancers/profile/ProfileSwitcherEnhancer');
          return new ProfileSwitcherEnhancer(element);
        
        case 'profile-selector':
          const { ProfileSelectorEnhancer } = await import('@/enhancers/profile/ProfileSwitcherEnhancer');
          return new ProfileSelectorEnhancer(element);
          
        default:
          this.logger.warn(`Unknown enhancer type: ${type}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to create enhancer of type ${type}:`, error);
      return null;
    }
  }

  private startObserving(root: Element): void {
    if (!this.domObserver.isActive()) {
      this.domObserver.start(root);
      this.logger.debug('Started DOM observation');
    }
  }

  private handleDOMChange(event: DOMChangeEvent): void {
    switch (event.type) {
      case 'added':
        this.queueElementForEnhancement(event.element);
        break;
        
      case 'removed':
        this.cleanupElement(event.element);
        break;
        
      case 'attributeChanged':
        if (event.attributeName?.startsWith('data-next-')) {
          this.logger.debug('Data attribute changed, re-enhancing element', {
            element: event.element.tagName,
            attribute: event.attributeName,
            oldValue: event.oldValue,
            newValue: event.newValue
          });
          
          // Re-enhance element when data attributes change
          this.cleanupElement(event.element);
          this.queueElementForEnhancement(event.element);
        }
        break;
    }
  }

  private queueElementForEnhancement(element: HTMLElement): void {
    this.scanQueue.add(element);
    this.processQueueDebounced();
  }

  private processQueueDebounced = this.debounce(() => {
    this.processQueue();
  }, 50);

  private async processQueue(): Promise<void> {
    if (this.scanQueue.size === 0) {
      return;
    }

    const elements = Array.from(this.scanQueue);
    this.scanQueue.clear();

    this.logger.debug(`Processing ${elements.length} queued elements`);

    for (const element of elements) {
      try {
        await this.enhanceElement(element);
      } catch (error) {
        this.logger.error('Failed to enhance queued element:', error, element);
      }
    }
  }

  private debounce(func: Function, wait: number): Function {
    let timeout: number | undefined;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  private cleanupElement(element: HTMLElement): void {
    const enhancers = this.enhancers.get(element);
    if (enhancers) {
      enhancers.forEach(enhancer => enhancer.destroy());
      this.enhancerCount -= enhancers.length;
      this.enhancers.delete(element);
    }
  }

  public destroy(): void {
    this.domObserver.destroy();
    
    // Clear any pending queue processing
    this.scanQueue.clear();
    
    // Note: WeakMap doesn't support iteration or clear()
    // Enhancers will be garbage collected when their elements are removed
    // Reset the count since we can't iterate to destroy remaining enhancers
    this.enhancerCount = 0;
    
    this.logger.debug('AttributeScanner destroyed');
  }

  public pause(): void {
    this.domObserver.pause();
    this.logger.debug('AttributeScanner paused');
  }

  public resume(root: Element = document.body): void {
    this.domObserver.resume(root);
    this.logger.debug('AttributeScanner resumed');
  }

  private updateEnhancerStats(type: string, time: number): void {
    const current = this.enhancerStats.get(type) || { totalTime: 0, count: 0 };
    current.totalTime += time;
    current.count += 1;
    this.enhancerStats.set(type, current);
  }

  private showPerformanceReport(): void {
    console.group('🚀 Enhancement Performance Report');
    
    // Convert to array and sort by total time
    const sortedStats = Array.from(this.enhancerStats.entries())
      .map(([type, stats]) => ({
        Enhancer: type,
        'Total Time (ms)': stats.totalTime.toFixed(2),
        'Average Time (ms)': (stats.totalTime / stats.count).toFixed(2),
        'Count': stats.count,
        'Impact': stats.totalTime > 50 ? '🔴 High' : stats.totalTime > 20 ? '🟡 Medium' : '🟢 Low'
      }))
      .sort((a, b) => parseFloat(b['Total Time (ms)']) - parseFloat(a['Total Time (ms)']));
    
    console.table(sortedStats);
    
    // Show top slowest enhancers
    const topSlow = sortedStats.slice(0, 3);
    if (topSlow.length > 0) {
      console.log('🐌 Slowest enhancers:');
      topSlow.forEach((stat, index) => {
        console.log(`${index + 1}. ${stat.Enhancer}: ${stat['Total Time (ms)']}ms (${stat.Count} instances)`);
      });
    }
    
    const totalTime = Array.from(this.enhancerStats.values())
      .reduce((sum, stats) => sum + stats.totalTime, 0);
    const totalCount = Array.from(this.enhancerStats.values())
      .reduce((sum, stats) => sum + stats.count, 0);
    
    console.log(`📊 Total enhancement time: ${totalTime.toFixed(2)}ms across ${totalCount} enhancers`);
    console.groupEnd();
  }

  public getStats(): { 
    enhancedElements: number; 
    queuedElements: number; 
    isObserving: boolean;
    isScanning: boolean;
    performanceStats?: Record<string, { totalTime: number; averageTime: number; count: number }>;
  } {
    const stats: any = {
      enhancedElements: this.enhancerCount,
      queuedElements: this.scanQueue.size,
      isObserving: this.domObserver.isActive(),
      isScanning: this.isScanning
    };

    // Include performance stats in debug mode
    if (this.isDebugMode && this.enhancerStats.size > 0) {
      stats.performanceStats = {};
      for (const [type, data] of this.enhancerStats.entries()) {
        stats.performanceStats[type] = {
          totalTime: data.totalTime,
          averageTime: data.totalTime / data.count,
          count: data.count
        };
      }
    }

    return stats;
  }
}