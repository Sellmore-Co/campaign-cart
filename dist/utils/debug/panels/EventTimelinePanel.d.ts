import { DebugPanel } from '../DebugPanels';
export declare class EventTimelinePanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    private events;
    private maxEvents;
    private isRecording;
    private filters;
    private startTime;
    private eventBus;
    constructor();
    private initializeEventWatching;
    private watchDataLayer;
    private watchInternalEvents;
    private watchDOMEvents;
    private watchPerformanceEvents;
    private addEvent;
    private formatRelativeTime;
    private getFilteredEvents;
    private getEventTypeColor;
    getTabs(): {
        id: string;
        label: string;
        icon: string;
        getContent: () => string;
    }[];
    private getTimelineContent;
    private getAnalyticsContent;
    private getFiltersContent;
    private getEventStats;
    private getTypeDistribution;
    private getSourceDistribution;
    getActions(): {
        label: string;
        action: () => void;
    }[];
    private exportEvents;
    private generateTestEvents;
    getContent(): string;
}
//# sourceMappingURL=EventTimelinePanel.d.ts.map