/**
 * Coupon Enhancer - Handles coupon input, validation, and display
 * 
 * Attributes:
 * - data-next-coupon (required on container)
 * - data-next-coupon="input" (on input element)
 * - data-next-coupon="apply" (on button element)
 * - data-next-coupon="display" (on display area)
 */

import { BaseActionEnhancer } from './base/BaseActionEnhancer';
import { useCartStore } from '@/stores/cartStore';

export class CouponEnhancer extends BaseActionEnhancer {
  private input: HTMLInputElement | null = null;
  private button: HTMLButtonElement | null = null;
  private display: HTMLElement | null = null;
  private template: HTMLElement | null = null;
  private unsubscribe: (() => void) | null = null;

  async initialize(): Promise<void> {
    this.logger.debug('Enhancing coupon element:', this.element);

    // Find elements based on different attribute patterns
    this.input = this.element.querySelector('input[os-checkout-field="coupon"]') || 
                this.element.querySelector('input[data-next-coupon="input"]') ||
                this.element.querySelector('input[type="text"]') ||
                this.element.querySelector('input'); // Fallback to any input
    
    this.button = this.element.querySelector('button') ||
                 this.element.querySelector('[data-next-coupon="apply"]');
    
    // Look for display in the same container or as a sibling
    this.display = this.element.querySelector('[data-next-coupon="display"]') ||
                  this.element.querySelector('[pb-checkout="coupon-display"]') ||
                  this.element.parentElement?.querySelector('[data-next-coupon="display"]') ||
                  document.querySelector('[data-next-coupon="display"]');
    
    this.template = this.display?.querySelector('[pb-checkout="coupon-card"]') || null;
    
    if (!this.input || !this.button) {
      this.logger.warn('Required coupon elements not found', { input: !!this.input, button: !!this.button });
      return;
    }
    
    // Setup event listeners
    this.setupInputListener();
    this.setupButtonListener();
    
    // Initial render
    this.updateButtonState();
    this.renderAppliedCoupons();
    
    // Subscribe to cart changes
    this.unsubscribe = useCartStore.subscribe(
      state => state.appliedCoupons,
      () => this.renderAppliedCoupons()
    );
    
    this.logger.info('Coupon enhancer initialized successfully');
  }

  private setupInputListener(): void {
    if (!this.input) return;
    
    this.input.addEventListener('input', () => {
      this.updateButtonState();
    });
    
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyCoupon();
      }
    });
  }

  private setupButtonListener(): void {
    if (!this.button) return;
    
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyCoupon();
    });
  }

  private updateButtonState(): void {
    if (!this.input || !this.button) return;
    
    const hasValue = this.input.value.trim().length > 0;
    
    if (hasValue) {
      this.button.classList.remove('next-disabled');
      this.button.disabled = false;
    } else {
      this.button.classList.add('next-disabled');
      this.button.disabled = true;
    }
  }

  private async applyCoupon(): Promise<void> {
    if (!this.input || !this.button) return;
    
    const code = this.input.value.trim();
    if (!code) return;
    
    await this.executeAction(
      async () => {
        this.logger.debug('Applying coupon:', code);
        
        const result = await useCartStore.getState().applyCoupon(code);
        
        if (result.success) {
          if (this.input) {
            this.input.value = '';
          }
          this.updateButtonState();
          this.showMessage(result.message, 'success');
          this.logger.info('Coupon applied successfully:', code);
          
          // Emit standard event
          this.eventBus.emit('coupon:applied', { code });
        } else {
          this.showMessage(result.message, 'error');
          this.logger.warn('Coupon application failed:', result.message);
          
          // Emit standard event
          this.eventBus.emit('coupon:validation-failed', { code, message: result.message });
        }
      },
      { showLoading: true, disableOnProcess: true }
    );
  }

  private renderAppliedCoupons(): void {
    if (!this.display || !this.template) {
      this.logger.debug('No display area or template found for coupons');
      return;
    }
    
    const coupons = useCartStore.getState().getCoupons();
    
    // Clear existing coupons (except template)
    const existingCoupons = this.display.querySelectorAll('[pb-checkout="coupon-card"]:not([data-template])');
    existingCoupons.forEach(el => el.remove());
    
    // Hide template
    this.template.style.display = 'none';
    this.template.setAttribute('data-template', 'true');
    
    // Render each coupon
    coupons.forEach(coupon => {
      const couponEl = this.template!.cloneNode(true) as HTMLElement;
      couponEl.removeAttribute('data-template');
      couponEl.style.display = '';
      
      // Update content
      const titleEl = couponEl.querySelector('[pb-checkout="coupon-title"]');
      if (titleEl) {
        titleEl.textContent = coupon.code;
      }
      
      const descEl = couponEl.querySelector('[pb-checkout="coupon-description"]');
      if (descEl && coupon.definition.description) {
        descEl.textContent = coupon.definition.description;
      }
      
      const discountEl = couponEl.querySelector('[pb-checkout="coupon-discount"]');
      if (discountEl) {
        // Import at the top of the file instead of dynamically here
        const { formatCurrency } = require('@/utils/currencyFormatter');
        const formatted = formatCurrency(coupon.discount);
        discountEl.textContent = `-${formatted}`;
      }
      
      // Setup remove button
      const removeBtn = couponEl.querySelector('[pb-checkout="coupon-remove"]');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this.removeCoupon(coupon.code);
        });
      }
      
      this.display!.appendChild(couponEl);
    });
    
    this.logger.debug('Rendered applied coupons:', coupons.length);
  }

  private removeCoupon(code: string): void {
    this.logger.debug('Removing coupon:', code);
    
    useCartStore.getState().removeCoupon(code);
    
    // Emit standard event
    this.eventBus.emit('coupon:removed', { code });
    
    this.showMessage(`Coupon ${code} removed`, 'info');
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.logger.debug(`Showing message [${type}]:`, message);
    
    // Try to find a message container
    const messageContainer = document.querySelector('[data-next-coupon="messages"]') ||
                           document.querySelector('.coupon-messages') ||
                           this.element?.querySelector('.messages');
    
    if (messageContainer) {
      // Clear existing messages
      messageContainer.innerHTML = '';
      
      // Create message element
      const messageEl = document.createElement('div');
      messageEl.className = `coupon-message coupon-message--${type}`;
      messageEl.textContent = message;
      
      messageContainer.appendChild(messageEl);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        messageEl.remove();
      }, 5000);
    } else {
      // Fallback to console for debugging
      console.log(`[Coupon ${type.toUpperCase()}] ${message}`);
    }
  }

  // emitEvent method removed - unused

  override async update(): Promise<void> {
    // Update display when cart state changes
    this.renderAppliedCoupons();
  }

  override destroy(): void {
    this.logger.debug('Destroying coupon enhancer');
    
    // Unsubscribe from cart changes
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // Remove event listeners (BaseEnhancer handles this)
    super.destroy();
    
    // Clear references
    this.input = null;
    this.button = null;
    this.display = null;
    this.template = null;
    
    this.logger.debug('Coupon enhancer destroyed');
  }
}