import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class CheckoutReviewEnhancer extends BaseEnhancer {
    private configs;
    private unsubscribe?;
    constructor(element: HTMLElement);
    initialize(): Promise<void>;
    update(): void;
    enhance(): Promise<void>;
    private updateDisplay;
    private getFieldValue;
    private formatValue;
    private formatCurrency;
    private formatAddress;
    private formatName;
    private formatPhone;
    private getCountryName;
    destroy(): void;
}
//# sourceMappingURL=CheckoutReviewEnhancer.d.ts.map