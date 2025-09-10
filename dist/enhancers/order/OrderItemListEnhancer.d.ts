import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class OrderItemListEnhancer extends BaseEnhancer {
    private template?;
    private emptyTemplate?;
    private apiClient?;
    initialize(): Promise<void>;
    update(data?: any): void;
    private checkAndLoadOrderFromUrl;
    private handleOrderUpdate;
    private renderEmptyOrder;
    private renderOrderItems;
    private renderOrderItem;
    private getDefaultItemTemplate;
    private prepareOrderLineData;
    getItemCount(): number;
    getItemElements(): NodeListOf<Element>;
}
//# sourceMappingURL=OrderItemListEnhancer.d.ts.map