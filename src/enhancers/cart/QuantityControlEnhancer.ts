/**
 * Quantity Control Enhancer
 * Handles increase/decrease quantity buttons and direct quantity input
 */

import { BaseCartEnhancer } from '@/enhancers/base/BaseCartEnhancer';
import { useCartStore } from '@/stores/cartStore';
import type { CartState } from '@/types/global';

export class QuantityControlEnhancer extends BaseCartEnhancer {
  private action!: 'increase' | 'decrease' | 'set';
  private packageId!: number;
  private step = 1;
  private min = 0;
  private max = 99;

  public async initialize(): Promise<void> {
    this.validateElement();

    // Get action type
    const actionAttr = this.getRequiredAttribute('data-next-quantity');
    if (!['increase', 'decrease', 'set'].includes(actionAttr)) {
      throw new Error(`Invalid quantity action: ${actionAttr}. Must be 'increase', 'decrease', or 'set'`);
    }
    this.action = actionAttr as 'increase' | 'decrease' | 'set';

    // Get package ID
    const packageIdAttr = this.getRequiredAttribute('data-package-id');
    this.packageId = parseInt(packageIdAttr, 10);
    if (isNaN(this.packageId)) {
      throw new Error(`Invalid package ID: ${packageIdAttr}`);
    }

    // Get optional attributes
    this.step = parseInt(this.getAttribute('data-step') || '1', 10) || 1;
    this.min = parseInt(this.getAttribute('data-min') || '0', 10) || 0;
    this.max = parseInt(this.getAttribute('data-max') || '99', 10) || 99;

    // Set up event listeners
    this.setupEventListeners();

    // Subscribe to cart changes using BaseCartEnhancer method
    this.setupCartSubscription();

    this.logger.debug(`QuantityControlEnhancer initialized for package ${this.packageId} with action ${this.action}`);
  }

  public update(data?: any): void {
    if (data) {
      this.handleCartUpdate(data);
    }
  }

  private setupEventListeners(): void {
    if (this.action === 'set' && (this.element.tagName === 'INPUT' || this.element.tagName === 'SELECT')) {
      // Handle input/select elements for direct quantity setting
      this.element.addEventListener('change', this.handleQuantityChange.bind(this));
      this.element.addEventListener('blur', this.handleQuantityChange.bind(this));
      
      // Prevent invalid input for number inputs
      if (this.element instanceof HTMLInputElement && this.element.type === 'number') {
        this.element.addEventListener('input', this.handleNumberInput.bind(this));
      }
    } else {
      // Handle button clicks for increase/decrease
      this.element.addEventListener('click', this.handleClick.bind(this));
    }
  }

  private async handleClick(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasClass('disabled') || this.element.hasAttribute('disabled')) {
      return;
    }

    try {
      this.addClass('processing');
      await this.updateQuantity();
    } catch (error) {
      this.handleError(error, 'handleClick');
    } finally {
      this.removeClass('processing');
    }
  }

  private async handleQuantityChange(event: Event): Promise<void> {
    if (this.action !== 'set') return;

    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const newQuantity = parseInt(target.value, 10);

    if (isNaN(newQuantity) || newQuantity < this.min) {
      target.value = String(this.min);
      return;
    }

    if (newQuantity > this.max) {
      target.value = String(this.max);
      return;
    }

    try {
      this.addClass('processing');
      const cartStore = useCartStore.getState();
      
      if (newQuantity === 0) {
        await cartStore.removeItem(this.packageId);
      } else {
        await cartStore.updateQuantity(this.packageId, newQuantity);
      }
    } catch (error) {
      this.handleError(error, 'handleQuantityChange');
      // Reset to current quantity on error
      const cartStore = useCartStore.getState();
      const currentQuantity = cartStore.getItemQuantity(this.packageId);
      target.value = String(currentQuantity);
    } finally {
      this.removeClass('processing');
    }
  }

  private handleNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);

    // Prevent negative numbers
    if (value < this.min) {
      input.value = String(this.min);
    }

    // Prevent exceeding max
    if (value > this.max) {
      input.value = String(this.max);
    }
  }

  private async updateQuantity(): Promise<void> {
    const cartStore = useCartStore.getState();
    const currentQuantity = cartStore.getItemQuantity(this.packageId);
    let newQuantity: number;

    switch (this.action) {
      case 'increase':
        newQuantity = Math.min(currentQuantity + this.step, this.max);
        break;
        
      case 'decrease':
        newQuantity = Math.max(currentQuantity - this.step, this.min);
        break;
        
      default:
        return; // 'set' action is handled by input change
    }

    if (newQuantity === currentQuantity) {
      this.logger.debug('Quantity unchanged, no action needed');
      return;
    }

    if (newQuantity <= 0) {
      await cartStore.removeItem(this.packageId);
      this.logger.debug(`Removed item ${this.packageId} from cart`);
    } else {
      await cartStore.updateQuantity(this.packageId, newQuantity);
      this.logger.debug(`Updated quantity for item ${this.packageId} to ${newQuantity}`);
    }

    // Emit custom event
    this.emitQuantityChangeEvent(currentQuantity, newQuantity);
  }

  protected handleCartUpdate(_cartState: CartState): void {
    const cartItem = this.getCartItem(this.packageId);
    const currentQuantity = cartItem?.quantity || 0;
    const isInCart = currentQuantity > 0;

    // Update button states
    this.updateButtonState(currentQuantity);

    // Update input values for 'set' action
    if (this.action === 'set' && (this.element instanceof HTMLInputElement || this.element instanceof HTMLSelectElement)) {
      if (this.element.value !== String(currentQuantity)) {
        this.element.value = String(currentQuantity);
      }
    }

    // Update element classes
    this.toggleClass('has-item', isInCart);
    this.toggleClass('empty', !isInCart);

    // Update data attributes for styling
    this.element.setAttribute('data-quantity', String(currentQuantity));
    this.element.setAttribute('data-in-cart', String(isInCart));
  }

  private updateButtonState(currentQuantity: number): void {
    const canIncrease = currentQuantity < this.max;
    const canDecrease = currentQuantity > this.min;

    switch (this.action) {
      case 'increase':
        this.toggleClass('disabled', !canIncrease);
        this.element.toggleAttribute('disabled', !canIncrease);
        this.setAttribute('aria-disabled', String(!canIncrease));
        break;
        
      case 'decrease':
        this.toggleClass('disabled', !canDecrease);
        this.element.toggleAttribute('disabled', !canDecrease);
        this.setAttribute('aria-disabled', String(!canDecrease));
        break;
        
      case 'set':
        // Input elements handle their own constraints
        if (this.element instanceof HTMLInputElement) {
          this.element.min = String(this.min);
          this.element.max = String(this.max);
          this.element.step = String(this.step);
        }
        break;
    }

    // Update button text/content if it contains quantity placeholders
    this.updateButtonContent(currentQuantity);
  }

  private updateButtonContent(currentQuantity: number): void {
    const originalContent = this.getAttribute('data-original-content') || this.element.innerHTML;
    
    if (!this.hasAttribute('data-original-content')) {
      this.setAttribute('data-original-content', this.element.innerHTML);
    }

    const newContent = originalContent
      .replace(/\{quantity\}/g, String(currentQuantity))
      .replace(/\{step\}/g, String(this.step));

    if (this.element.innerHTML !== newContent) {
      this.element.innerHTML = newContent;
    }
  }

  private emitQuantityChangeEvent(oldQuantity: number, newQuantity: number): void {
    this.emit('cart:quantity-changed', {
      packageId: this.packageId,
      quantity: newQuantity,
      oldQuantity
    });
  }

  public getCurrentQuantity(): number {
    const cartStore = useCartStore.getState();
    return cartStore.getItemQuantity(this.packageId);
  }

  public setQuantity(quantity: number): Promise<void> {
    const clampedQuantity = Math.max(this.min, Math.min(this.max, quantity));
    const cartStore = useCartStore.getState();
    
    if (clampedQuantity <= 0) {
      return cartStore.removeItem(this.packageId);
    } else {
      return cartStore.updateQuantity(this.packageId, clampedQuantity);
    }
  }

  public getConstraints(): { min: number; max: number; step: number } {
    return {
      min: this.min,
      max: this.max,
      step: this.step
    };
  }
}