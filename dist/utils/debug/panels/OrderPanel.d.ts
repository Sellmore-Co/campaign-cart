import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
export declare class OrderPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getOrderLinesContent;
    private getAddressesContent;
    private getRawDataContent;
    private getEmptyState;
    getActions(): PanelAction[];
    private exportOrder;
}
//# sourceMappingURL=OrderPanel.d.ts.map