import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
export declare class StoragePanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getNextContent;
    private getLocalStorageContent;
    private getSessionStorageContent;
    getActions(): PanelAction[];
    private getLocalStorageData;
    private getSessionStorageData;
    private getNextItems;
    private formatValue;
    private getStorageSize;
    private clearNextStorage;
    private clearLocalStorage;
    private clearSessionStorage;
    private exportStorage;
}
//# sourceMappingURL=StoragePanel.d.ts.map