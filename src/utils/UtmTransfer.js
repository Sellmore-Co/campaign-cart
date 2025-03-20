/**
 * UTM Parameter Transfer Utility
 * 
 * This utility automatically adds the current URL's query parameters (UTM and others)
 * to all links on a page when they are clicked.
 * 
 * Configuration via window.osConfig.utmTransfer = {
 *   enabled: true,                 // Whether to enable UTM transfer
 *   applyToExternalLinks: false,   // Whether to apply to external links
 *   excludedDomains: [],           // Domains to exclude from parameter transfer
 *   paramsToCopy: []               // Specific params to copy (empty = all params)
 * }
 */

class UtmTransfer {
  constructor() {
    this.config = {
      enabled: true,
      applyToExternalLinks: false,
      excludedDomains: [],
      paramsToCopy: []
    };
    
    // Load configuration
    this.loadConfig();
  }
  
  loadConfig() {
    if (window.osConfig && window.osConfig.utmTransfer) {
      this.config = {
        ...this.config,
        ...window.osConfig.utmTransfer
      };
    }
    
    // Ensure paramsToCopy is valid
    if (this.config.paramsToCopy === null || this.config.paramsToCopy === undefined) {
      this.config.paramsToCopy = [];
    }
    
    console.log('UTM Transfer: Initialized with config', JSON.stringify(this.config));
  }
  
  // Initialize the UTM transfer feature
  init() {
    if (!this.config.enabled) {
      console.log('UTM Transfer: Disabled by configuration');
      return;
    }
    
    // Get current URL search parameters
    const currentParams = new URLSearchParams(window.location.search);
    
    // Skip if no parameters exist
    if (currentParams.toString() === '') {
      console.log('UTM Transfer: No URL parameters to transfer');
      return;
    }
    
    // Log all available parameters
    const availableParams = [];
    currentParams.forEach((value, key) => {
      availableParams.push(`${key}=${value}`);
    });
    console.log(`UTM Transfer: Available parameters: ${availableParams.join(', ')}`);
    
    // Filter parameters if specific ones are specified
    let paramsToApply = currentParams;
    
    // Only filter if paramsToCopy is explicitly provided and has items
    if (Array.isArray(this.config.paramsToCopy) && this.config.paramsToCopy.length > 0) {
      console.log(`UTM Transfer: Filtering to specific parameters: ${this.config.paramsToCopy.join(', ')}`);
      
      paramsToApply = new URLSearchParams();
      this.config.paramsToCopy.forEach(param => {
        if (currentParams.has(param)) {
          paramsToApply.append(param, currentParams.get(param));
          console.log(`UTM Transfer: Found parameter to copy: ${param}=${currentParams.get(param)}`);
        }
      });
      
      // Skip if no matching parameters
      if (paramsToApply.toString() === '') {
        console.log('UTM Transfer: No matching parameters to transfer');
        return;
      }
    } else {
      console.log('UTM Transfer: No specific parameters configured, will copy all parameters');
    }
    
    // Get all anchor elements on the page
    const links = document.querySelectorAll('a');
    console.log(`UTM Transfer: Found ${links.length} links on the page`);
    
    // For each link
    links.forEach(link => {
      // Add click event listener
      link.addEventListener('click', event => {
        this.applyParamsToLink(link, paramsToApply);
      });
    });
    
    console.log('UTM Transfer: Event listeners attached to links');
  }
  
  // Apply parameters to a specific link
  applyParamsToLink(linkElement, params = null) {
    if (!linkElement || !linkElement.getAttribute) {
      console.error('UTM Transfer: Invalid link element provided');
      return;
    }
    
    // Get the href attribute
    let href = linkElement.getAttribute('href');
    if (!href) return;
    
    // Skip special links
    if (href.startsWith('#') || 
        href.startsWith('javascript:') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:')) {
      return;
    }
    
    // Handle external links
    const isExternalLink = href.includes('://') && !href.includes(window.location.hostname);
    if (isExternalLink) {
      // Skip external links if not configured to apply to them
      if (!this.config.applyToExternalLinks) {
        return;
      }
      
      // Check excluded domains
      if (this.config.excludedDomains && this.config.excludedDomains.length > 0) {
        for (const domain of this.config.excludedDomains) {
          if (href.includes(domain)) {
            return; // Skip excluded domains
          }
        }
      }
    }
    
    // Use provided params or get current ones
    const paramsToApply = params || new URLSearchParams(window.location.search);
    if (paramsToApply.toString() === '') {
      return; // No parameters to apply
    }
    
    // Parse the link's URL
    let url;
    try {
      // Handle relative URLs
      url = new URL(href, window.location.origin);
    } catch (e) {
      console.error('UTM Transfer: Invalid URL:', href);
      return;
    }
    
    // Get existing parameters in the link
    const linkParams = new URLSearchParams(url.search);
    
    // Add current page parameters, without overriding existing ones
    paramsToApply.forEach((value, key) => {
      if (!linkParams.has(key)) {
        linkParams.append(key, value);
      }
    });
    
    // Update the link's search parameters
    url.search = linkParams.toString();
    
    // Update the href attribute
    linkElement.setAttribute('href', url.toString());
    
    // Log if in debug mode
    if (this.config.debug) {
      console.log(`UTM Transfer: Updated link ${href} to ${url.toString()}`);
    }
  }
}

// Export a function to initialize the UTM transfer
export const initUtmTransfer = () => {
  const utmTransfer = new UtmTransfer();
  utmTransfer.init();
  
  // Also expose for manual use
  return utmTransfer;
}; 