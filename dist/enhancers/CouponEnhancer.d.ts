import { BaseActionEnhancer } from './base/BaseActionEnhancer';
export declare class CouponEnhancer extends BaseActionEnhancer {
    private input;
    private button;
    private display;
    private template;
    private unsubscribe;
    initialize(): Promise<void>;
    private setupInputListener;
    private setupButtonListener;
    private updateButtonState;
    private applyCoupon;
    private renderAppliedCoupons;
    private removeCoupon;
    private showMessage;
    update(): Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=CouponEnhancer.d.ts.map