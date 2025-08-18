import { DebugPanel, PanelAction, PanelTab } from '../DebugPanels';
import { DebugEvent } from '../DebugEventManager';
export declare class EventsPanel implements DebugPanel {
    private events;
    id: string;
    title: string;
    icon: string;
    constructor(events: DebugEvent[]);
    getContent(): string;
    getTabs(): PanelTab[];
    private getOverviewContent;
    private getTimelineContent;
    private getAnalyticsContent;
    getActions(): PanelAction[];
    private getEventsPerMinute;
    private getSourceStatistics;
    private safeStringify;
    private formatEventData;
    private clearEvents;
    private exportEvents;
    private startRecording;
}
//# sourceMappingURL=EventsPanel.d.ts.map