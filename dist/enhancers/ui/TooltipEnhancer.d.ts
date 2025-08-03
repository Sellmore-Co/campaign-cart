import { BaseEnhancer } from '../base/BaseEnhancer';
export interface TooltipConfig {
    placement?: 'top' | 'bottom' | 'left' | 'right';
    offset?: number;
    delay?: number;
    maxWidth?: string;
    className?: string;
}
export declare class TooltipEnhancer extends BaseEnhancer {
    private tooltip;
    private arrow;
    private showTimeout;
    private hideTimeout;
    private config;
    private isVisible;
    private static stylesInjected;
    constructor(element: HTMLElement);
    initialize(): Promise<void>;
    update(): void;
    destroy(): void;
    private parseConfig;
    private injectStyles;
    private setupEventListeners;
    protected cleanupEventListeners(): void;
    private handleMouseEnter;
    private handleMouseLeave;
    private handleFocus;
    private handleBlur;
    private handleTouchStart;
    private handleKeydown;
    private scheduleShow;
    private scheduleHide;
    private cleanupTimeouts;
    private show;
    private hide;
    private getTooltipContent;
    private updateTooltipContent;
    private createTooltip;
    private positionTooltip;
}
//# sourceMappingURL=TooltipEnhancer.d.ts.map