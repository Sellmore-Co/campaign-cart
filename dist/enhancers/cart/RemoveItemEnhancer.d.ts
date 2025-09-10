import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class RemoveItemEnhancer extends BaseEnhancer {
    private packageId;
    private confirmRemoval;
    private confirmMessage;
    initialize(): Promise<void>;
    update(data?: any): void;
    private handleClick;
    private removeItem;
    private emitRemoveEvent;
    private handleCartUpdate;
    private updateButtonContent;
    private addRemovalFeedback;
    getCurrentQuantity(): number;
    isInCart(): boolean;
    setConfirmation(enabled: boolean, message?: string): void;
}
//# sourceMappingURL=RemoveItemEnhancer.d.ts.map