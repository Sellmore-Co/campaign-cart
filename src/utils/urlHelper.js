/**
 * Builds a final redirect URL for funnel steps, ensuring ref_id and debug parameters are correctly handled.
 * 
 * @param {string} targetPath - The base path or URL to redirect to (e.g., "/upsell/2", "/receipt").
 * @param {string|null} orderRef - The order reference ID to append as ref_id.
 * @param {boolean} includeDebug - Whether to append debug=true based on the current window location.
 * @returns {string} The fully constructed URL string.
 */
export function buildFunnelRedirectUrl(targetPath, orderRef, includeDebug) {
  let finalUrl = targetPath;
  const logger = window.os?.logger?.createModuleLogger('URL_HELPER') || { 
    debug: console.debug, 
    error: console.error, 
    info: console.info
  }; // Basic fallback logger

  try {
    // Use current origin if targetPath is relative
    const url = new URL(targetPath, window.location.origin);

    // 1. Add ref_id if provided and not already present
    if (orderRef && !url.searchParams.has('ref_id')) {
      url.searchParams.append('ref_id', orderRef);
      logger.debug(`Appended ref_id=${orderRef}`);
    }

    // 2. Preserve debug parameter if requested and not already present
    if (includeDebug && !url.searchParams.has('debug')) {
      const currentUrlParams = new URLSearchParams(window.location.search);
      if (currentUrlParams.get('debug') === 'true') {
         url.searchParams.append('debug', 'true');
         logger.debug('Appended debug=true parameter.');
      }
    }
    
    finalUrl = url.href;

  } catch (error) {
    logger.error('Error constructing URL object, falling back to basic append:', error);
    // Fallback: try appending manually (less safe)
    let constructedUrl = targetPath;
    const hasQuery = targetPath.includes('?');
    
    // Append ref_id if needed
    if (orderRef && !targetPath.includes('ref_id=')) {
        constructedUrl += (hasQuery ? '&' : '?') + `ref_id=${orderRef}`;
    }

    // Append debug if needed
    if (includeDebug && !targetPath.includes('debug=true')) {
        const currentUrlParams = new URLSearchParams(window.location.search);
        if (currentUrlParams.get('debug') === 'true') {
            constructedUrl += (constructedUrl.includes('?') ? '&' : '?') + 'debug=true';
        }
    }
    finalUrl = constructedUrl;
  }
  
  logger.info(`Built redirect URL: ${finalUrl}`);
  return finalUrl;
} 