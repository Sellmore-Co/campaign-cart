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
export function preserveQueryParams(targetUrl: string, preserveParams: string[] = ['debug', 'debugger']): string {
  try {
    // Parse the target URL
    const url = new URL(targetUrl, window.location.origin);
    
    // Get current URL parameters
    const currentParams = new URLSearchParams(window.location.search);
    
    // Preserve specified parameters
    preserveParams.forEach(param => {
      const value = currentParams.get(param);
      if (value && !url.searchParams.has(param)) {
        url.searchParams.append(param, value);
      }
    });
    
    // Special handling for debug parameter variations
    if (currentParams.get('debug') === 'true' && !url.searchParams.has('debug')) {
      url.searchParams.append('debug', 'true');
    }
    if (currentParams.get('debugger') === 'true' && !url.searchParams.has('debugger')) {
      url.searchParams.append('debugger', 'true');
    }
    
    return url.href;
  } catch (error) {
    console.error('[URL Utils] Error preserving query parameters:', error);
    // Return original URL if parsing fails
    return targetUrl;
  }
}

/**
 * Navigate to a URL while preserving debug parameters
 * @param url - The URL to navigate to
 * @param options - Navigation options
 */
export function navigateWithParams(url: string, options?: { replace?: boolean; preserveParams?: string[] }): void {
  const finalUrl = preserveQueryParams(url, options?.preserveParams);
  
  if (options?.replace) {
    window.location.replace(finalUrl);
  } else {
    window.location.href = finalUrl;
  }
}

/**
 * Check if debug mode is active
 * @returns true if debug mode is enabled via URL parameters
 */
export function isDebugMode(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get('debug') === 'true' || params.get('debugger') === 'true';
}