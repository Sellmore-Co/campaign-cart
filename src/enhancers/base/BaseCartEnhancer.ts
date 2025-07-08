import { BaseEnhancer } from './BaseEnhancer';
import { useCartStore } from '@/stores/cartStore';
import type { CartState, CartItem } from '@/types/global';

export abstract class BaseCartEnhancer extends BaseEnhancer {
  protected cartState?: CartState;
  
  /**
   * Setup cart store subscription
   * Automatically subscribes to cart updates and initializes with current state
   */
  protected setupCartSubscription(): void {
    // Subscribe to cart updates
    this.subscribe(useCartStore, this.handleCartUpdate.bind(this));
    
    // Initialize with current state
    this.cartState = useCartStore.getState();
  }
  
  /**
   * Handle cart state updates
   * Must be implemented by subclasses to react to cart changes
   */
  protected abstract handleCartUpdate(state: CartState): void;
  
  /**
   * Check if cart is empty
   */
  protected isCartEmpty(): boolean {
    return this.cartState?.isEmpty ?? true;
  }
  
  /**
   * Get cart item by package ID
   */
  protected getCartItem(packageId: number): CartItem | undefined {
    return this.cartState?.items.find(item => item.packageId === packageId);
  }
  
  /**
   * Get total quantity of items in cart
   */
  protected getTotalQuantity(): number {
    return this.cartState?.totalQuantity ?? 0;
  }
  
  /**
   * Get cart totals
   */
  protected getCartTotals() {
    return this.cartState?.totals ?? {
      subtotal: { value: 0, formatted: '$0.00' },
      shipping: { value: 0, formatted: '$0.00' },
      tax: { value: 0, formatted: '$0.00' },
      discounts: { value: 0, formatted: '$0.00' },
      total: { value: 0, formatted: '$0.00' },
      count: 0,
      isEmpty: true,
      savings: { value: 0, formatted: '$0.00' },
      savingsPercentage: { value: 0, formatted: '0%' },
      compareTotal: { value: 0, formatted: '$0.00' },
      hasSavings: false,
    };
  }
  
  /**
   * Get all cart items
   */
  protected getCartItems(): CartItem[] {
    return this.cartState?.items ?? [];
  }
  
  /**
   * Check if a package is in cart
   */
  protected hasPackageInCart(packageId: number): boolean {
    return this.getCartItem(packageId) !== undefined;
  }
}