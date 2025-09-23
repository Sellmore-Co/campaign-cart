/**
 * URL utility functions for checkout forms
 */

export function getUrlParam(param: string): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || undefined;
}

export function getSuccessUrl(): string {
  // Check for meta tag first (support both new and legacy names)
  const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                 document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                 document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;

  if (metaTag?.content) {
    // Check if it's already an absolute URL
    if (metaTag.content.startsWith('http://') || metaTag.content.startsWith('https://')) {
      return metaTag.content;
    }
    // Convert to absolute URL if it's a relative path
    // Add leading slash if not present for relative paths
    const path = metaTag.content.startsWith('/') ? metaTag.content : '/' + metaTag.content;
    return window.location.origin + path;
  }

  // Fallback to default success page
  return window.location.origin + '/success';
}

export function getFailureUrl(): string {
  // Check for meta tag first (support both new and legacy names)
  const metaTag = document.querySelector('meta[name="next-failure-url"]') as HTMLMetaElement ||
                 document.querySelector('meta[name="os-failure-url"]') as HTMLMetaElement;

  if (metaTag?.content) {
    // Check if it's already an absolute URL
    if (metaTag.content.startsWith('http://') || metaTag.content.startsWith('https://')) {
      return metaTag.content;
    }
    // Convert to absolute URL if it's a relative path
    // Add leading slash if not present for relative paths
    const path = metaTag.content.startsWith('/') ? metaTag.content : '/' + metaTag.content;
    return window.location.origin + path;
  }

  // Fallback to current checkout page with error parameters
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('payment_failed', 'true');
  return currentUrl.href;
}