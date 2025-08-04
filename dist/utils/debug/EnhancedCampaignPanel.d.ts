import { DebugPanel, PanelAction, PanelTab } from './DebugPanels';
export declare class EnhancedCampaignPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getPackagesContent;
    private getShippingContent;
    private getRawDataContent;
    private getCampaignOverview;
    private getPackagesSection;
    private getPackageCard;
    private getShippingMethodsSection;
    private getPriceRange;
    getActions(): PanelAction[];
    private exportPackages;
    private testAllPackages;
}
//# sourceMappingURL=EnhancedCampaignPanel.d.ts.map