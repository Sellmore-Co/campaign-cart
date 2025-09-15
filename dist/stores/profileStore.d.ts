import { CartItem } from '../types/global';
export interface ProfileMapping {
    [originalId: number]: number;
}
export interface Profile {
    id: string;
    name: string;
    description?: string;
    packageMappings: ProfileMapping;
    reverseMapping?: ProfileMapping;
    isActive?: boolean;
    priority?: number;
}
export interface MappingEvent {
    timestamp: number;
    profileId: string;
    action: 'applied' | 'reverted' | 'switched';
    itemsAffected: number;
    previousProfileId?: string;
}
export interface ProfileState {
    profiles: Map<string, Profile>;
    activeProfileId: string | null;
    previousProfileId: string | null;
    mappingHistory: MappingEvent[];
    originalCartSnapshot?: CartItem[];
}
export interface ProfileActions {
    registerProfile(profile: Profile): void;
    activateProfile(profileId: string): void;
    deactivateProfile(): void;
    getMappedPackageId(originalId: number): number;
    getOriginalPackageId(mappedId: number): number | null;
    mapPackageIds(packageIds: number[]): number[];
    getActiveProfile(): Profile | null;
    hasProfile(profileId: string): boolean;
    getProfileById(profileId: string): Profile | null;
    getAllProfiles(): Profile[];
    setOriginalCartSnapshot(items: CartItem[]): void;
    clearOriginalCartSnapshot(): void;
    addMappingEvent(event: Omit<MappingEvent, 'timestamp'>): void;
    clearHistory(): void;
    reset(): void;
}
export declare const useProfileStore: import('zustand').UseBoundStore<Omit<Omit<import('zustand').StoreApi<ProfileState & ProfileActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import('zustand/middleware').PersistOptions<ProfileState & ProfileActions, ProfileState & ProfileActions>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ProfileState & ProfileActions) => void) => () => void;
        onFinishHydration: (fn: (state: ProfileState & ProfileActions) => void) => () => void;
        getOptions: () => Partial<import('zustand/middleware').PersistOptions<ProfileState & ProfileActions, ProfileState & ProfileActions>>;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: ProfileState & ProfileActions, previousSelectedState: ProfileState & ProfileActions) => void): () => void;
        <U>(selector: (state: ProfileState & ProfileActions) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
//# sourceMappingURL=profileStore.d.ts.map