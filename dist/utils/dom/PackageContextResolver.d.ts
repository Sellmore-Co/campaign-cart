export declare class PackageContextResolver {
    private static logger;
    private static readonly PACKAGE_ID_ATTRS;
    /**
     * Find package ID from parent DOM context
     * Searches up the DOM tree for package ID attributes
     */
    static findPackageId(element: HTMLElement): number | undefined;
    /**
     * Get package ID from element or its context
     * First checks element itself, then searches parents
     */
    static getPackageId(element: HTMLElement): number | undefined;
}
//# sourceMappingURL=PackageContextResolver.d.ts.map