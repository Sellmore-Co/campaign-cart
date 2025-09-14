import { ConfigState } from '../types/global.js';
interface ConfigActions {
    loadFromMeta: () => void;
    loadFromWindow: () => void;
    updateConfig: (config: Partial<ConfigState>) => void;
    setSpreedlyEnvironmentKey: (key: string) => void;
    reset: () => void;
    loadProfiles: () => void;
}
export declare const configStore: import('zustand').UseBoundStore<import('zustand').StoreApi<ConfigState & ConfigActions>>;
export { configStore as useConfigStore };
//# sourceMappingURL=configStore.d.ts.map