import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';

export declare class EnhancerPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getElementsContent;
    private getPerformanceContent;
    getActions(): PanelAction[];
    private getEnhancedElements;
    private generateSelector;
    private getElementEnhancers;
    private getEnhancerTypes;
    private getPerformanceStats;
    private highlightAllElements;
    private clearHighlights;
    private refreshScan;
}
//# sourceMappingURL=EnhancerPanel.d.ts.map