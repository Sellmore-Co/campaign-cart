import { EventMap } from '../types/global';
export declare class EventBus {
    private static instance;
    private listeners;
    private constructor();
    static getInstance(): EventBus;
    on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
    off<K extends keyof EventMap>(event: K, handler: Function): void;
    removeAllListeners<K extends keyof EventMap>(event?: K): void;
}
//# sourceMappingURL=events.d.ts.map