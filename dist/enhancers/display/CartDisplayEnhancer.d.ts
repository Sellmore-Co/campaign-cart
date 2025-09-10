import { BaseDisplayEnhancer } from './DisplayEnhancerCore';
import { CartState } from '../../types/global';
export declare class CartDisplayEnhancer extends BaseDisplayEnhancer {
    private cartState?;
    private includeDiscounts;
    initialize(): Promise<void>;
    protected setupStoreSubscriptions(): void;
    private handleCartUpdate;
    protected getPropertyValue(): any;
    protected performInitialUpdate(): Promise<void>;
    getCartProperty(cartState: CartState, property: string): any;
    refreshDisplay(): void;
}
//# sourceMappingURL=CartDisplayEnhancer.d.ts.map