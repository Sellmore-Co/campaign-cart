import { DebugEventManager } from './DebugEventManager';
import { DebugPanel } from './panels';

export declare class DebugOverlay {
    private static instance;
    private visible;
    private isExpanded;
    private container;
    private activePanel;
    private activePanelTab;
    private updateInterval;
    private logger;
    private eventManager;
    private panels;
    private static readonly EXPANDED_STORAGE_KEY;
    static getInstance(): DebugOverlay;
    private constructor();
    private initializePanels;
    private setupEventListeners;
    initialize(): void;
    show(): Promise<void>;
    hide(): void;
    toggle(): Promise<void>;
    isVisible(): boolean;
    private createOverlay;
    private updateOverlay;
    private updateContent;
    private addEventListeners;
    private handleContainerClick;
    private updateBodyHeight;
    private startAutoUpdate;
    private stopAutoUpdate;
    getEventManager(): DebugEventManager;
    getPanels(): DebugPanel[];
    setActivePanel(panelId: string): void;
    logEvent(type: string, data: any, source?: string): void;
    private clearCart;
    private exportAllData;
    private toggleMiniCart;
    private updateMiniCart;
    private toggleXray;
    private updateButtonStates;
    updateQuickStats(): void;
}
export declare const debugOverlay: DebugOverlay;
//# sourceMappingURL=DebugOverlay.d.ts.map