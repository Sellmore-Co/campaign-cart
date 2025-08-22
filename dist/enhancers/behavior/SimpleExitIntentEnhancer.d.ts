import { BaseEnhancer } from '../base/BaseEnhancer';
export declare class ExitIntentEnhancer extends BaseEnhancer {
    private isEnabled;
    private triggerCount;
    private lastTriggerTime;
    private maxTriggers;
    private cooldownPeriod;
    private imageUrl;
    private action;
    private popupElement;
    private overlayElement;
    private mouseLeaveHandler;
    private scrollHandler;
    private disableOnMobile;
    private mobileScrollTrigger;
    private sessionStorageKey;
    private useSessionStorage;
    constructor();
    initialize(): Promise<void>;
    update(data?: any): Promise<void>;
    setup(options: {
        image: string;
        action?: () => void | Promise<void>;
        disableOnMobile?: boolean;
        mobileScrollTrigger?: boolean;
        maxTriggers?: number;
        useSessionStorage?: boolean;
        sessionStorageKey?: string;
    }): void;
    disable(): void;
    reset(): void;
    private setupEventListeners;
    private isMobileDevice;
    private shouldTrigger;
    private triggerExitIntent;
    private saveToSessionStorage;
    private showPopup;
    private createPopupElements;
    hidePopup(): void;
    protected cleanupEventListeners(): void;
    destroy(): void;
}
//# sourceMappingURL=SimpleExitIntentEnhancer.d.ts.map