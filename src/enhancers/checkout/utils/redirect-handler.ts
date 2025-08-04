/**
 * Redirect Handler - Handles order completion redirects
 */

import { getNextPageUrlFromMeta } from './meta-tag-utils';
import { preserveQueryParams } from '@/utils/url-utils';
import type { Logger } from '@/utils/logger';

export function handleOrderRedirect(order: any, logger: Logger, emitCallback: (event: string, data: any) => void): void {
  // Follow the same pattern as the old system
  let redirectUrl: string | undefined;
  
  // 1. HIGHEST PRIORITY: payment_complete_url (for express payments that redirect to payment gateways)
  if (order.payment_complete_url) {
    logger.debug(`Using payment_complete_url from API: ${order.payment_complete_url}`);
    redirectUrl = order.payment_complete_url;
  }
  // 2. SECOND PRIORITY: Meta tag for custom success URL
  else {
    const nextPageUrl = getNextPageUrlFromMeta(order.ref_id);
    if (nextPageUrl) {
      logger.debug(`Using success URL from meta tag: ${nextPageUrl}`);
      redirectUrl = nextPageUrl;
    }
    // 3. THIRD PRIORITY: order_status_url (standard completed orders)
    else if (order.order_status_url) {
      logger.debug(`Using order_status_url from API: ${order.order_status_url}`);
      redirectUrl = order.order_status_url;
    }
    // 4. FALLBACK: Construct confirmation URL
    else {
      logger.warn('No order_status_url found in API response - using fallback URL');
      redirectUrl = `${window.location.origin}/checkout/confirmation/?ref_id=${order.ref_id || ''}`;
    }
  }
  
  if (redirectUrl) {
    // Preserve debug parameters when redirecting
    const finalUrl = preserveQueryParams(redirectUrl);
    logger.info('Redirecting to:', finalUrl);
    window.location.href = finalUrl;
  } else {
    logger.error('No redirect URL could be determined');
    // Emit event so parent can handle custom redirect logic
    emitCallback('order:redirect-missing', { order });
  }
}