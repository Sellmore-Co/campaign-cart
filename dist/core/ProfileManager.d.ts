import { CartItem } from '../types/global';
import { Package } from '../types/campaign';
export interface ApplyProfileOptions {
    clearCart?: boolean;
    preserveQuantities?: boolean;
    skipValidation?: boolean;
}
export interface MappedCartItem {
    originalItem: CartItem;
    mappedPackageId: number;
    quantity: number;
    mappedPackage?: Package;
    preserveUnmapped?: boolean;
}
export declare class ProfileManager {
    private static instance;
    private logger;
    private eventBus;
    private profileOperationInProgress;
    private initialCartState;
    private constructor();
    static getInstance(): ProfileManager;
    private captureInitialState;
    applyProfile(profileId: string, options?: ApplyProfileOptions): Promise<void>;
    private mapCartItems;
    private applyMappedItems;
    revertProfile(): Promise<void>;
    switchProfile(fromProfileId: string | null, toProfileId: string, options?: ApplyProfileOptions): Promise<void>;
    canApplyProfile(profileId: string): boolean;
    getProfileStats(): {
        activeProfile: string | null;
        previousProfile: string | null;
        totalProfiles: number;
        historyLength: number;
        hasOriginalSnapshot: boolean;
    };
    clearAllProfiles(): Promise<void>;
}
//# sourceMappingURL=ProfileManager.d.ts.map