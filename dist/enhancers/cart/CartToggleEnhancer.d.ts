import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class CartToggleEnhancer extends BaseEnhancer {
    private packageId?;
    private quantity;
    private syncPackageIds;
    private isSyncMode;
    private stateContainer?;
    private isUpsell;
    private clickHandler?;
    private isInitialized;
    private isAutoAdding;
    initialize(): Promise<void>;
    private findStateContainer;
    private resolvePackageIdentifier;
    private checkSyncMode;
    private setQuantity;
    private detectUpsellContext;
    private checkAutoAdd;
    private setupEventListeners;
    private handleClick;
    private addToCart;
    private removeFromCart;
    private updateState;
    private updateSyncedQuantity;
    private handleSyncUpdate;
    private isInCart;
    private setLoadingState;
    update(): void;
    protected cleanupEventListeners(): void;
}
//# sourceMappingURL=CartToggleEnhancer.d.ts.map