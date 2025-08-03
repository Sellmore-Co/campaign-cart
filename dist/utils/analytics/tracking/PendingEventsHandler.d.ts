import { DataLayerEvent } from '../types';
export interface PendingEventV2 {
    event: DataLayerEvent;
    timestamp: number;
    id: string;
}
export declare class PendingEventsHandler {
    private static instance;
    private constructor();
    static getInstance(): PendingEventsHandler;
    /**
     * Queue an event to be fired after redirect
     */
    queueEvent(event: DataLayerEvent): void;
    /**
     * Get all pending events
     */
    private getPendingEvents;
    /**
     * Process and fire all pending events
     */
    processPendingEvents(): void;
    /**
     * Clear all pending events
     */
    clearPendingEvents(): void;
    /**
     * Reset the handler (called by NextAnalytics)
     */
    reset(): void;
    /**
     * Initialize the handler (called by NextAnalytics)
     */
    initialize(): void;
}
export declare const pendingEventsHandler: PendingEventsHandler;
//# sourceMappingURL=PendingEventsHandler.d.ts.map