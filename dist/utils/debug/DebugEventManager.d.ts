/**
 * Debug Event Manager
 * Handles event capture and logging for debug overlay
 */
export interface DebugEvent {
    timestamp: Date;
    type: string;
    data: any;
    source: string;
}
export declare class DebugEventManager {
    private eventLog;
    private maxEvents;
    constructor();
    private initializeEventCapture;
    private interceptFetch;
    logEvent(type: string, data: any, source: string): void;
    getEvents(limit?: number): DebugEvent[];
    clearEvents(): void;
    exportEvents(): string;
}
//# sourceMappingURL=DebugEventManager.d.ts.map