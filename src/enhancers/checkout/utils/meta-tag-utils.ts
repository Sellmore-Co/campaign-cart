/**
 * Meta tag utility functions for checkout forms
 */

export function setOrCreateMetaTag(name: string, content: string): void {
  let metaTag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.name = name;
    document.head.appendChild(metaTag);
  }
  
  metaTag.content = content;
}

export function getNextPageUrlFromMeta(refId?: string): string | null {
  // Check for both new and legacy meta tag names
  const metaTag = document.querySelector('meta[name="next-success-url"]') as HTMLMetaElement ||
                 document.querySelector('meta[name="next-next-url"]') as HTMLMetaElement ||
                 document.querySelector('meta[name="os-next-page"]') as HTMLMetaElement;
  
  if (!metaTag?.content) {
    return null;
  }
  
  const nextPagePath = metaTag.content;
  
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