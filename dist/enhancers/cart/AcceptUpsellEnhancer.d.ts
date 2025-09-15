import { BaseActionEnhancer } from '../base/BaseActionEnhancer';
export declare class AcceptUpsellEnhancer extends BaseActionEnhancer {
    private packageId?;
    private quantity;
    private selectorId?;
    private nextUrl?;
    private apiClient?;
    private selectedItem?;
    private clickHandler?;
    private loadingOverlay;
    private pageShowHandler?;
    constructor(element: HTMLElement);
    initialize(): Promise<void>;
    private setupSelectorListener;
    private findSelectorElement;
    private getSelectedItemFromElement;
    private handleSelectorChange;
    private updateButtonState;
    private setEnabled;
    private handleClick;
    triggerAcceptUpsell(): Promise<void>;
    private getCurrency;
    private acceptUpsell;
    private checkIfUpsellAlreadyAccepted;
    private showDuplicateUpsellDialog;
    update(_data?: any): void;
    destroy(): void;
}
//# sourceMappingURL=AcceptUpsellEnhancer.d.ts.map