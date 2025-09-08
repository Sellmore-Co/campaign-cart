export declare class ProfileMapper {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): ProfileMapper;
    mapPackageId(packageId: number, profileId?: string): number;
    mapPackageIds(packageIds: number[], profileId?: string): number[];
    getOriginalPackageId(mappedId: number, profileId?: string): number | null;
    canMapPackage(packageId: number, profileId?: string): boolean;
    getProfileMappings(profileId?: string): Record<number, number> | null;
    hasActiveProfile(): boolean;
    getActiveProfileId(): string | null;
    mapCartItem<T extends {
        packageId: number;
    }>(item: T, profileId?: string): T;
    mapCartItems<T extends {
        packageId: number;
    }>(items: T[], profileId?: string): T[];
    getMappingStats(profileId?: string): {
        profileId: string | null;
        totalMappings: number;
        activeMappings: number;
        hasReverseMapping: boolean;
    } | null;
}
//# sourceMappingURL=ProfileMapper.d.ts.map