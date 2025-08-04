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
    constructor();
    initialize(): Promise<void>;
    update(data?: any): Promise<void>;
    setup(options: {
        image: string;
        action?: () => void | Promise<void>;
    }): void;
    disable(): void;
    private setupEventListeners;
    private shouldTrigger;
    private triggerExitIntent;
    private showPopup;
    private createPopupElements;
    hidePopup(): void;
    protected cleanupEventListeners(): void;
    destroy(): void;
}
//# sourceMappingURL=SimpleExitIntentEnhancer.d.ts.map