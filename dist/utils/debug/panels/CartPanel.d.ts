import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

export declare class CartPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getItemsContent;
    private getRawDataContent;
    getActions(): PanelAction[];
    private addTestItems;
    private exportCart;
}
//# sourceMappingURL=CartPanel.d.ts.map