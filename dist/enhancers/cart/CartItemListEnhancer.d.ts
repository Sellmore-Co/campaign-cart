import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class CartItemListEnhancer extends BaseEnhancer {
    private template?;
    private emptyTemplate?;
    private titleMap?;
    private lastRenderedItems;
    private groupItems;
    initialize(): Promise<void>;
    update(data?: any): void;
    private handleCartUpdate;
    private renderEmptyCart;
    private renderCartItems;
    private renderCartItem;
    private getDefaultItemTemplate;
    private enhanceNewElements;
    private prepareCartItemData;
    getItemCount(): number;
    getItemElements(): NodeListOf<Element>;
    refreshItem(_packageId: number): void;
    private groupIdenticalItems;
    private formatVariantAttributes;
    private formatVariantAttributesList;
    private extractIndividualAttributes;
}
//# sourceMappingURL=CartItemListEnhancer.d.ts.map