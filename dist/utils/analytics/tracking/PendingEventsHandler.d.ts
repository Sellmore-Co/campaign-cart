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
    queueEvent(event: DataLayerEvent): void;
    private getPendingEvents;
    processPendingEvents(): void;
    clearPendingEvents(): void;
    reset(): void;
    initialize(): void;
}
export declare const pendingEventsHandler: PendingEventsHandler;
//# sourceMappingURL=PendingEventsHandler.d.ts.map