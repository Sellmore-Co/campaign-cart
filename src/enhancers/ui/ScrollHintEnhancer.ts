/**
 * Scroll Hint Enhancer
 * Shows/hides a scroll hint based on whether content is scrollable and scroll position
 * 
 * Attributes:
 * - data-next-component="scroll-hint" - Marks the scroll hint element
 * - data-next-scroll-target - Optional selector for the scrollable container (defaults to finding nearby .cart-items__list)
 * - data-next-scroll-threshold - Optional scroll threshold in pixels (defaults to 5)
 * 
 * Usage:
 * <div data-next-component="scroll-hint" class="cart-items__scroll-hint cart-items__scroll-hint--active">
 *   <div>Scroll for more items</div>
 * </div>
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';

export class ScrollHintEnhancer extends BaseEnhancer {
  private scrollTarget?: HTMLElement;
  private scrollThreshold: number = 5;
  private activeClass: string = 'cart-items__scroll-hint--active';
  private scrollHandler?: () => void;
  private resizeHandler?: () => void;
  private mutationObserver?: MutationObserver;
  private rafId?: number;

  public async initialize(): Promise<void> {
    this.validateElement();
    
    // Get configuration from attributes
    this.scrollThreshold = parseInt(this.getAttribute('data-next-scroll-threshold') || '5', 10);
    
    // Find scroll target
    const targetSelector = this.getAttribute('data-next-scroll-target');
    if (targetSelector) {
      this.scrollTarget = document.querySelector(targetSelector) as HTMLElement;
    } else {
      // Default: look for .cart-items__list sibling or nearby element
      const target = this.findScrollTarget();
      if (target) {
        this.scrollTarget = target;
      }
    }
    
    if (!this.scrollTarget) {
      this.logger.warn('No scroll target found for scroll hint');
      return;
    }
    
    // Set up event handlers
    this.scrollHandler = this.throttle(this.updateScrollHint.bind(this), 16); // ~60fps
    this.resizeHandler = this.debounce(this.updateScrollHint.bind(this), 100);
    
    // Add event listeners
    this.scrollTarget.addEventListener('scroll', this.scrollHandler);
    window.addEventListener('resize', this.resizeHandler);
    
    // Set up mutation observer to watch for content changes
    this.observeContentChanges();
    
    // Initial check
    this.updateScrollHint();
    
    this.logger.debug('ScrollHintEnhancer initialized', {
      scrollTarget: this.scrollTarget,
      threshold: this.scrollThreshold
    });
  }

  private findScrollTarget(): HTMLElement | null {
    // Look for common patterns
    const patterns = [
      '.cart-items__list',
      '[data-next-cart-items]',
      '[data-next-order-items]',
      '.order-items__list',
      '.scrollable-content'
    ];
    
    // First check siblings
    const parent = this.element.parentElement;
    if (parent) {
      for (const pattern of patterns) {
        const target = parent.querySelector(pattern) as HTMLElement;
        if (target) return target;
      }
    }
    
    // Then check broader context
    const container = this.element.closest('.order-summary, .cart-items, .modal-content');
    if (container) {
      for (const pattern of patterns) {
        const target = container.querySelector(pattern) as HTMLElement;
        if (target) return target;
      }
    }
    
    return null;
  }

  private observeContentChanges(): void {
    if (!this.scrollTarget) return;
    
    this.mutationObserver = new MutationObserver(() => {
      // Debounce updates when content changes
      this.scheduleUpdate();
    });
    
    this.mutationObserver.observe(this.scrollTarget, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private scheduleUpdate(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    this.rafId = requestAnimationFrame(() => {
      this.updateScrollHint();
    });
  }

  private hasScrollableContent(): boolean {
    if (!this.scrollTarget) return false;
    return this.scrollTarget.scrollHeight > this.scrollTarget.clientHeight;
  }

  private updateScrollHint(): void {
    if (!this.scrollTarget) return;
    
    // Check if content is scrollable
    if (!this.hasScrollableContent()) {
      // No overflow, hide scroll hint
      this.removeClass(this.activeClass);
      this.setAttribute('aria-hidden', 'true');
      return;
    }
    
    // Check if user is at the top
    const isAtTop = this.scrollTarget.scrollTop <= this.scrollThreshold;
    
    if (isAtTop) {
      this.addClass(this.activeClass);
      this.setAttribute('aria-hidden', 'false');
    } else {
      this.removeClass(this.activeClass);
      this.setAttribute('aria-hidden', 'true');
    }
    
    // Emit event for other components that might be interested
    this.eventBus.emit('scroll-hint:updated' as any, {
      isVisible: isAtTop && this.hasScrollableContent(),
      scrollTop: this.scrollTarget.scrollTop,
      scrollHeight: this.scrollTarget.scrollHeight,
      clientHeight: this.scrollTarget.clientHeight
    });
  }

  private throttle(func: Function, limit: number): () => void {
    let inThrottle: boolean = false;
    
    return (...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  private debounce(func: Function, wait: number): () => void {
    let timeout: number | undefined;
    
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func.apply(this, args), wait);
    };
  }

  public update(): void {
    // Re-check scroll state when cart updates
    this.updateScrollHint();
  }

  public override destroy(): void {
    // Clean up event listeners
    if (this.scrollTarget && this.scrollHandler) {
      this.scrollTarget.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    
    // Clean up mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    
    // Cancel any pending animation frame
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    
    super.destroy();
  }
}