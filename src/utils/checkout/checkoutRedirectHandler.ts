import type { Logger } from '@/utils/logger';
import { preserveQueryParams } from '@/utils/url-utils';

export class CheckoutRedirectHandler {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  public handleOrderRedirect(order: any): void {
    // Follow the same pattern as the old system
    let redirectUrl: string | undefined;
    
    // 1. HIGHEST PRIORITY: payment_complete_url (for express payments that redirect to payment gateways)
    if (order.payment_complete_url) {
      this.logger.debug(`Using payment_complete_url from API: ${order.payment_complete_url}`);
      redirectUrl = order.payment_complete_url;
    }
    // 2. SECOND PRIORITY: Meta tag for custom success URL
    else {
      const nextPageUrl = this.getNextPageUrlFromMeta(order.ref_id);
      if (nextPageUrl) {
        this.logger.debug(`Using success URL from meta tag: ${nextPageUrl}`);
        redirectUrl = nextPageUrl;
      }
      // 3. THIRD PRIORITY: order_status_url (standard completed orders)
      else if (order.order_status_url) {
        this.logger.debug(`Using order_status_url from API: ${order.order_status_url}`);
        redirectUrl = order.order_status_url;
      }
      // 4. FALLBACK: Construct confirmation URL
      else {
        this.logger.warn('No order_status_url found in API response - using fallback URL');
        redirectUrl = `${window.location.origin}/checkout/confirmation/?ref_id=${order.ref_id || ''}`;
      }
    }
    
    if (redirectUrl) {
      // Preserve debug parameters when redirecting
      const finalUrl = preserveQueryParams(redirectUrl);
      this.logger.info('Redirecting to:', finalUrl);
      window.location.href = finalUrl;
    } else {
      this.logger.error('No redirect URL could be determined');
      // Could emit event here for custom handling
    }
  }

  private getNextPageUrlFromMeta(refId?: string): string | null {
    // Check for both new and legacy meta tag names
    const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
    
    if (!metaTag?.content) {
      this.logger.debug('No meta tag found for next page URL');
      return null;
    }
    
    const nextPagePath = metaTag.content;
    this.logger.debug(`Found meta tag with next page URL: ${nextPagePath}`);
    
    // Convert to full URL if it's not already
    const redirectUrl = nextPagePath.startsWith('http') ? 
      new URL(nextPagePath) : 
      new URL(nextPagePath, window.location.origin);
    
    // Add ref_id as query param if provided
    if (refId) {
      redirectUrl.searchParams.append('ref_id', refId);
    }
    
    return redirectUrl.href;
  }

  public getSuccessUrl(): string {
    // Check for meta tag first (support both new and legacy names)
    const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
    if (metaTag?.content) {
      return metaTag.content;
    }
    
    // Fallback to default success page
    return window.location.origin + '/success';
  }

  public getFailureUrl(): string {
    // Check for meta tag first (support both new and legacy names)  
    const metaTag = document.querySelector('meta[name="next-failure-url"]') as HTMLMetaElement ||
                   document.querySelector('meta[name="os-failure-url"]') as HTMLMetaElement;
    if (metaTag?.content) {
      return metaTag.content;
    }
    
    // Fallback to current checkout page with error parameters
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('payment_failed', 'true');
    return currentUrl.href;
  }
}