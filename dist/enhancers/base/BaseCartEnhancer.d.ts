import { BaseEnhancer } from './BaseEnhancer';
import { CartState, CartItem } from '../../types/global';

export declare abstract class BaseCartEnhancer extends BaseEnhancer {
    protected cartState?: CartState;
    /**
     * Setup cart store subscription
     * Automatically subscribes to cart updates and initializes with current state
     */
    protected setupCartSubscription(): void;
    /**
     * Handle cart state updates
     * Must be implemented by subclasses to react to cart changes
     */
    protected abstract handleCartUpdate(state: CartState): void;
    /**
     * Check if cart is empty
     */
    protected isCartEmpty(): boolean;
    /**
     * Get cart item by package ID
     */
    protected getCartItem(packageId: number): CartItem | undefined;
    /**
     * Get total quantity of items in cart
     */
    protected getTotalQuantity(): number;
    /**
     * Get cart totals
     */
    protected getCartTotals(): import('../../types/global').CartTotals | {
        subtotal: {
            value: number;
            formatted: string;
        };
        shipping: {
            value: number;
            formatted: string;
        };
        tax: {
            value: number;
            formatted: string;
        };
        discounts: {
            value: number;
            formatted: string;
        };
        total: {
            value: number;
            formatted: string;
        };
        count: number;
        isEmpty: true;
        savings: {
            value: number;
            formatted: string;
        };
        savingsPercentage: {
            value: number;
            formatted: string;
        };
        compareTotal: {
            value: number;
            formatted: string;
        };
        hasSavings: false;
    };
    /**
     * Get all cart items
     */
    protected getCartItems(): CartItem[];
    /**
     * Check if a package is in cart
     */
    protected hasPackageInCart(packageId: number): boolean;
}
//# sourceMappingURL=BaseCartEnhancer.d.ts.map