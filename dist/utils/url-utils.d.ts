/**
 * URL Utilities
 * Helper functions for URL manipulation and parameter preservation
 */
/**
 * Preserves debug and other important query parameters when navigating
 * @param targetUrl - The URL to navigate to
 * @param preserveParams - Array of parameter names to preserve (defaults to ['debug', 'debugger'])
 * @returns The URL with preserved parameters
 */
export declare function preserveQueryParams(targetUrl: string, preserveParams?: string[]): string;
/**
 * Navigate to a URL while preserving debug parameters
 * @param url - The URL to navigate to
 * @param options - Navigation options
 */
export declare function navigateWithParams(url: string, options?: {
    replace?: boolean;
    preserveParams?: string[];
}): void;
/**
 * Check if debug mode is active
 * @returns true if debug mode is enabled via URL parameters
 */
export declare function isDebugMode(): boolean;
//# sourceMappingURL=url-utils.d.ts.map