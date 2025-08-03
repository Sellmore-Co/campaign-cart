import { BaseEnhancer } from './BaseEnhancer';
import { CartState, CartItem } from '../../types/global';
export declare abstract class BaseCartEnhancer extends BaseEnhancer {
    protected cartState?: CartState;
    protected setupCartSubscription(): void;
    protected abstract handleCartUpdate(state: CartState): void;
    protected isCartEmpty(): boolean;
    protected getCartItem(packageId: number): CartItem | undefined;
    protected getTotalQuantity(): number;
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
    protected getCartItems(): CartItem[];
    protected hasPackageInCart(packageId: number): boolean;
}
//# sourceMappingURL=BaseCartEnhancer.d.ts.map