import { Order, AddUpsellLine } from '../types/api';
export interface OrderState {
    order: Order | null;
    refId: string | null;
    orderLoadedAt: number | null;
    isLoading: boolean;
    isProcessingUpsell: boolean;
    error: string | null;
    upsellError: string | null;
    pendingUpsells: AddUpsellLine[];
    completedUpsells: string[];
    completedUpsellPages: string[];
    viewedUpsells: string[];
    viewedUpsellPages: string[];
    upsellJourney: Array<{
        packageId?: string;
        pagePath?: string;
        action: 'viewed' | 'accepted' | 'skipped';
        timestamp: number;
    }>;
}
export interface OrderActions {
    setOrder: (order: Order) => void;
    setRefId: (refId: string) => void;
    loadOrder: (refId: string, apiClient: any) => Promise<void>;
    clearOrder: () => void;
    isOrderExpired: () => boolean;
    addUpsell: (upsellData: AddUpsellLine, apiClient: any) => Promise<Order | null>;
    addPendingUpsell: (upsellData: AddUpsellLine) => void;
    removePendingUpsell: (index: number) => void;
    clearPendingUpsells: () => void;
    markUpsellCompleted: (packageId: string) => void;
    markUpsellViewed: (packageId: string) => void;
    markUpsellPageViewed: (pagePath: string) => void;
    markUpsellSkipped: (packageId: string, pagePath?: string) => void;
    setError: (error: string | null) => void;
    setUpsellError: (error: string | null) => void;
    clearErrors: () => void;
    setLoading: (loading: boolean) => void;
    setProcessingUpsell: (processing: boolean) => void;
    hasUpsellPageBeenCompleted: (pagePath: string) => boolean;
    hasUpsellBeenViewed: (packageId: string) => boolean;
    hasUpsellPageBeenViewed: (pagePath: string) => boolean;
    getOrderTotal: () => number;
    canAddUpsells: () => boolean;
    getUpsellJourney: () => any[];
    reset: () => void;
}
export declare const useOrderStore: import('zustand').UseBoundStore<Omit<Omit<import('zustand').StoreApi<OrderState & OrderActions>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: (OrderState & OrderActions) | Partial<OrderState & OrderActions> | ((state: OrderState & OrderActions) => (OrderState & OrderActions) | Partial<OrderState & OrderActions>), replace?: boolean | undefined, action?: A | undefined): void;
}, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<OrderState & OrderActions, OrderState & OrderActions>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: OrderState & OrderActions) => void) => () => void;
        onFinishHydration: (fn: (state: OrderState & OrderActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<OrderState & OrderActions, OrderState & OrderActions>>;
    };
}>;
//# sourceMappingURL=orderStore.d.ts.map