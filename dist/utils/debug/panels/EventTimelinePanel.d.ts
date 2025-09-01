import { DebugPanel, PanelAction } from '../DebugPanels';
export declare class EventTimelinePanel implements DebugPanel {
    id: string;
    title: string;
    icon: string;
    private events;
    private maxEvents;
    private isRecording;
    private showInternalEvents;
    private updateTimeout;
    private saveTimeout;
    private selectedEventId;
    private eventBus;
    private static readonly EVENTS_STORAGE_KEY;
    private static readonly SHOW_INTERNAL_KEY;
    private static readonly MAX_STORED_EVENTS;
    constructor();
    private loadSavedState;
    private saveEvents;
    toggleInternalEvents(): void;
    private initializeEventWatching;
    private watchDataLayer;
    private watchInternalEvents;
    private watchDOMEvents;
    private static instance;
    private static getInstance;
    private watchPerformanceEvents;
    private addEvent;
    private formatRelativeTime;
    private formatTimestamp;
    private getFilteredEvents;
    private getEventTypeColor;
    private getEventTypeBadge;
    private showEventModal;
    private closeEventModal;
    getContent(): string;
    getActions(): PanelAction[];
}
//# sourceMappingURL=EventTimelinePanel.d.ts.map