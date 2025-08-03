export interface StorageOptions {
    key: string;
    storage?: Storage;
    serialize?: (value: any) => string;
    deserialize?: (value: string) => any;
}
export declare class StorageManager {
    private logger;
    private storage;
    private serialize;
    private deserialize;
    constructor(options?: Partial<StorageOptions>);
    set<T>(key: string, value: T): boolean;
    get<T>(key: string, defaultValue?: T): T | undefined;
    remove(key: string): boolean;
    clear(): boolean;
    has(key: string): boolean;
    keys(): string[];
    size(): number;
}
export declare const sessionStorageManager: StorageManager;
export declare const localStorageManager: StorageManager;
export declare const createStoragePersist: <T>(storageManager: StorageManager, key: string, partialize?: (state: T) => Partial<T>) => {
    name: string;
    storage: {
        getItem: (name: string) => string | null;
        setItem: (name: string, value: string) => void;
        removeItem: (name: string) => void;
    };
};
export declare const CART_STORAGE_KEY = "next-cart-state";
export declare const CONFIG_STORAGE_KEY = "next-config-state";
export declare const CAMPAIGN_STORAGE_KEY = "next-campaign-cache";
export declare const TIMER_STORAGE_PREFIX = "next-timer-";
export declare const getTimerKey: (persistenceId: string) => string;
export declare const saveTimerState: (persistenceId: string, endTime: number) => void;
export declare const loadTimerState: (persistenceId: string) => number | null;
export declare const clearTimerState: (persistenceId: string) => void;
export declare const getStorageQuota: () => Promise<{
    quota: number;
    usage: number;
} | null>;
export declare const onStorageChange: (callback: (event: {
    key: string;
    oldValue: any;
    newValue: any;
}) => void) => (() => void);
//# sourceMappingURL=storage.d.ts.map