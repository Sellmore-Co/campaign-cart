import { BaseActionEnhancer } from '../base/BaseActionEnhancer';
export declare class AddToCartEnhancer extends BaseActionEnhancer {
    private packageId?;
    private quantity;
    private selectorId?;
    private selectedItem?;
    private clickHandler?;
    private redirectUrl?;
    private clearCart;
    initialize(): Promise<void>;
    private setupSelectorListener;
    private findSelectorElement;
    private getSelectedItemFromElement;
    private handleSelectorChange;
    private updateButtonState;
    private setEnabled;
    private handleClick;
    private addToCart;
    update(_data?: any): void;
    destroy(): void;
}
//# sourceMappingURL=AddToCartEnhancer.d.ts.map