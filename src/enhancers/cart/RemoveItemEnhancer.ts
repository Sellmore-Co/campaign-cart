/**
 * Remove Item Enhancer
 * Handles removing individual items from the cart
 */

import { BaseEnhancer } from '@/enhancers/base/BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import type { CartState } from '@/types/global';

export class RemoveItemEnhancer extends BaseEnhancer {
  private packageId!: number;
  private confirmRemoval = false;
  private confirmMessage = 'Are you sure you want to remove this item?';

  public async initialize(): Promise<void> {
    this.validateElement();

    // Get package ID
    const packageIdAttr = this.getRequiredAttribute('data-package-id');
    this.packageId = parseInt(packageIdAttr, 10);
    if (isNaN(this.packageId)) {
      throw new Error(`Invalid package ID: ${packageIdAttr}`);
    }

    // Get optional attributes
    this.confirmRemoval = this.getAttribute('data-confirm') === 'true';
    this.confirmMessage = this.getAttribute('data-confirm-message') || this.confirmMessage;

    // Set up event listener
    this.element.addEventListener('click', this.handleClick.bind(this));

    // Subscribe to cart changes to update button state
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));

    // Initial state update
    this.handleCartUpdate(useCartStore.getState());

    this.logger.debug(`RemoveItemEnhancer initialized for package ${this.packageId}`);
  }

  public update(data?: any): void {
    if (data) {
      this.handleCartUpdate(data);
    }
  }

  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasClass('disabled') || this.element.hasAttribute('disabled')) {
      return;
    }

    // Confirmation dialog if enabled
    if (this.confirmRemoval) {
      if (!confirm(this.confirmMessage)) {
        return;
      }
    }

    try {
      this.addClass('processing');
      await this.removeItem();
    } catch (error) {
      this.handleError(error, 'handleClick');
    } finally {
      this.removeClass('processing');
    }
  }

  private async removeItem(): Promise<void> {
    const cartStore = useCartStore.getState();
    const currentQuantity = cartStore.getItemQuantity(this.packageId);

    if (currentQuantity === 0) {
      this.logger.debug(`Item ${this.packageId} not in cart, nothing to remove`);
      return;
    }

    await cartStore.removeItem(this.packageId);
    this.logger.debug(`Removed item ${this.packageId} from cart`);

    // Emit custom event
    this.emitRemoveEvent();

    // Add visual feedback
    this.addRemovalFeedback();
  }

  private emitRemoveEvent(): void {
    this.emit('cart:item-removed', { packageId: this.packageId });
  }

  private handleCartUpdate(cartState: CartState): void {
    const currentQuantity = cartState.items.find(item => item.packageId === this.packageId)?.quantity || 0;
    const isInCart = currentQuantity > 0;

    // Update button state
    this.toggleClass('disabled', !isInCart);
    this.element.toggleAttribute('disabled', !isInCart);
    this.setAttribute('aria-disabled', String(!isInCart));

    // Update element classes
    this.toggleClass('has-item', isInCart);
    this.toggleClass('empty', !isInCart);

    // Update data attributes for styling
    this.element.setAttribute('data-quantity', String(currentQuantity));
    this.element.setAttribute('data-in-cart', String(isInCart));

    // Update button content if it contains quantity placeholders
    this.updateButtonContent(currentQuantity);
  }

  private updateButtonContent(currentQuantity: number): void {
    const originalContent = this.getAttribute('data-original-content') || this.element.innerHTML;
    
    if (!this.hasAttribute('data-original-content')) {
      this.setAttribute('data-original-content', this.element.innerHTML);
    }

    const newContent = originalContent
      .replace(/\{quantity\}/g, String(currentQuantity));

    if (this.element.innerHTML !== newContent) {
      this.element.innerHTML = newContent;
    }
  }


  private addRemovalFeedback(): void {
    // Add temporary visual feedback
    this.addClass('item-removed');
    
    // Find the parent cart item element to animate
    const cartItem = this.element.closest('[data-cart-item-id], .cart-item');
    if (cartItem instanceof HTMLElement) {
      cartItem.classList.add('removing');
      
      // Remove the class after animation completes
      setTimeout(() => {
        cartItem.classList.remove('removing');
      }, 300);
    }

    // Remove feedback class after a delay
    setTimeout(() => {
      this.removeClass('item-removed');
    }, 300);
  }

  public getCurrentQuantity(): number {
    const cartStore = useCartStore.getState();
    return cartStore.getItemQuantity(this.packageId);
  }

  public isInCart(): boolean {
    return this.getCurrentQuantity() > 0;
  }

  public setConfirmation(enabled: boolean, message?: string): void {
    this.confirmRemoval = enabled;
    if (message) {
      this.confirmMessage = message;
    }
  }
}