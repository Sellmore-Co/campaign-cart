export interface ParameterState {
    params: Record<string, string>;
    updateParam: (key: string, value: string) => void;
    updateParams: (params: Record<string, string>) => void;
    mergeParams: (params: Record<string, string>) => void;
    getParam: (key: string) => string | undefined;
    hasParam: (key: string) => boolean;
    clearParams: () => void;
    removeParam: (key: string) => void;
    debug: () => void;
}
export declare const useParameterStore: import('zustand').UseBoundStore<Omit<import('zustand').StoreApi<ParameterState>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<ParameterState, ParameterState>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ParameterState) => void) => () => void;
        onFinishHydration: (fn: (state: ParameterState) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<ParameterState, ParameterState>>;
    };
}>;
//# sourceMappingURL=parameterStore.d.ts.map