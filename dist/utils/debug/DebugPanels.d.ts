import { DebugEvent } from './DebugEventManager';
export interface DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent: () => string;
    getActions?: () => PanelAction[];
    getTabs?: () => PanelTab[];
}
export interface PanelTab {
    id: string;
    label: string;
    icon?: string;
    getContent: () => string;
}
export interface PanelAction {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}
export declare class CartPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getActions(): PanelAction[];
    private addTestItem;
}
export declare class ConfigPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getActions(): PanelAction[];
    private reloadConfig;
    private testApiConnection;
}
export declare class CampaignPanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getActions(): PanelAction[];
}
export declare class EventsPanel implements DebugPanel {
    private events;
    id: string;
    title: string;
    icon: string;
    constructor(events: DebugEvent[]);
    getContent(): string;
    getActions(): PanelAction[];
    private exportEvents;
}
export declare class StoragePanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    getContent(): string;
    getActions(): PanelAction[];
    private clearAllStorage;
    private exportStorageData;
}
//# sourceMappingURL=DebugPanels.d.ts.map