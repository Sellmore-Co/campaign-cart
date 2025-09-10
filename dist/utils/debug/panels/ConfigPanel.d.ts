import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
export declare class ConfigPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getSettingsContent;
    private getRawDataContent;
    getActions(): PanelAction[];
    private toggleDebug;
    private toggleTestMode;
    private exportConfig;
    private resetConfig;
}
//# sourceMappingURL=ConfigPanel.d.ts.map