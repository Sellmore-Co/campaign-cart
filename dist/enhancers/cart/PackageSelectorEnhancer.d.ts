import { BaseEnhancer } from '../base/BaseEnhancer';
import { SelectorItem } from '../../types/global';
export declare class PackageSelectorEnhancer extends BaseEnhancer {
    private selectorId;
    private mode;
    private items;
    private selectedItem;
    private clickHandlers;
    private mutationObserver;
    initialize(): Promise<void>;
    private initializeSelectorCards;
    private registerCard;
    private setupMutationObserver;
    private handlePackageIdChange;
    private updateItemPackageData;
    private handleCardRemoval;
    private handleCardClick;
    private selectItem;
    private updateCart;
    private setShippingMethod;
    private syncWithCart;
    update(): void;
    getSelectedItem(): SelectorItem | null;
    getSelectorConfig(): {
        id: string;
        mode: string;
        itemCount: number;
    };
    protected cleanupEventListeners(): void;
    destroy(): void;
}
//# sourceMappingURL=PackageSelectorEnhancer.d.ts.map