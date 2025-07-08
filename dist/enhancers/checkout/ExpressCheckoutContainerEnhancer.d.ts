import { BaseEnhancer } from '../base/BaseEnhancer';

export declare class ExpressCheckoutContainerEnhancer extends BaseEnhancer {
    private buttonsContainer?;
    private buttonInstances;
    private buttonClickHandlers;
    private paymentConfig?;
    private orderManager?;
    private expressProcessor?;
    initialize(): Promise<void>;
    private handleConfigUpdate;
    private updateExpressCheckoutButtons;
    private hideContainer;
    private showContainer;
    private clearButtons;
    private handleButtonClick;
    private handleCartUpdate;
    private createPayPalButton;
    private createApplePayButton;
    private createGooglePayButton;
    private createButton;
    update(): void;
    destroy(): void;
}
//# sourceMappingURL=ExpressCheckoutContainerEnhancer.d.ts.map