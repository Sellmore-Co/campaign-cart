import { BaseEnhancer } from '../base/BaseEnhancer';
interface FomoItem {
    text: string;
    image: string;
}
interface FomoConfig {
    items?: FomoItem[];
    customers?: {
        [country: string]: string[];
    } | undefined;
    maxMobileShows?: number;
    displayDuration?: number;
    delayBetween?: number;
    initialDelay?: number;
    country?: string;
}
export declare class FomoPopupEnhancer extends BaseEnhancer {
    private config;
    private isActive;
    private showCount;
    private popupElement;
    private timeoutIds;
    private defaultItems;
    private defaultCustomers;
    constructor();
    update(data?: any): Promise<void>;
    private loadItemsFromCampaign;
    initialize(): Promise<void>;
    setup(config?: FomoConfig): void;
    start(): void;
    stop(): void;
    private showNextPopup;
    private getRandomItem;
    private getRandomCustomer;
    private detectCountry;
    private createPopupElement;
    private updatePopupContent;
    private showPopup;
    private hidePopup;
    private injectStyles;
    protected cleanupEventListeners(): void;
    destroy(): void;
}
export {};
//# sourceMappingURL=FomoPopupEnhancer.d.ts.map