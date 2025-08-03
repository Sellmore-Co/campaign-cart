import { c as createLogger } from "./index-BB9Yg8yZ.js";
const logger = createLogger("UtmTransfer");
class UtmTransfer {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      applyToExternalLinks: false,
      excludedDomains: [],
      paramsToCopy: [],
      debug: false,
      ...config
    };
    this.paramsToApply = new URLSearchParams();
  }
  /**
   * Initialize the UTM transfer feature
   */
  init() {
    if (!this.config.enabled) {
      logger.debug("UTM Transfer disabled by configuration");
      return;
    }
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.toString() === "") {
      logger.debug("No URL parameters to transfer");
      return;
    }
    if (this.config.debug) {
      const availableParams = [];
      currentParams.forEach((value, key) => {
        availableParams.push(`${key}=${value}`);
      });
      logger.debug(`Available parameters: ${availableParams.join(", ")}`);
    }
    this.prepareParameters(currentParams);
    if (this.paramsToApply.toString() === "") {
      logger.debug("No matching parameters to transfer");
      return;
    }
    this.enhanceLinks();
    this.observeNewLinks();
    logger.debug(`UTM Transfer initialized with parameters: ${this.paramsToApply.toString()}`);
  }
  /**
   * Prepare parameters to apply based on configuration
   */
  prepareParameters(currentParams) {
    if (Array.isArray(this.config.paramsToCopy) && this.config.paramsToCopy.length > 0) {
      logger.debug(`Filtering to specific parameters: ${this.config.paramsToCopy.join(", ")}`);
      this.config.paramsToCopy.forEach((param) => {
        if (currentParams.has(param)) {
          this.paramsToApply.append(param, currentParams.get(param));
          logger.debug(`Found parameter to copy: ${param}=${currentParams.get(param)}`);
        }
      });
    } else {
      logger.debug("No specific parameters configured, will copy all parameters");
      currentParams.forEach((value, key) => {
        this.paramsToApply.append(key, value);
      });
    }
  }
  /**
   * Enhance all existing links on the page
   */
  enhanceLinks() {
    const links = document.querySelectorAll("a");
    logger.debug(`Found ${links.length} links on the page`);
    links.forEach((link) => {
      this.addClickListener(link);
    });
  }
  /**
   * Add click listener to a link
   */
  addClickListener(link) {
    if (link.dataset.utmEnhanced === "true") {
      return;
    }
    link.addEventListener("click", (_event) => {
      this.applyParamsToLink(link);
    });
    link.dataset.utmEnhanced = "true";
  }
  /**
   * Apply parameters to a specific link
   */
  applyParamsToLink(linkElement) {
    if (!linkElement || !linkElement.getAttribute) {
      logger.error("Invalid link element provided");
      return;
    }
    const href = linkElement.getAttribute("href");
    if (!href) return;
    if (this.shouldSkipLink(href)) {
      return;
    }
    if (this.isExternalLink(href)) {
      if (!this.config.applyToExternalLinks) {
        return;
      }
      if (this.isExcludedDomain(href)) {
        return;
      }
    }
    let url;
    try {
      url = new URL(href, window.location.origin);
    } catch (e) {
      logger.error("Invalid URL:", href);
      return;
    }
    const linkParams = new URLSearchParams(url.search);
    let paramsAdded = false;
    this.paramsToApply.forEach((value, key) => {
      if (!linkParams.has(key)) {
        linkParams.append(key, value);
        paramsAdded = true;
      }
    });
    if (paramsAdded) {
      url.search = linkParams.toString();
      linkElement.setAttribute("href", url.toString());
      logger.debug(`Updated link ${href} to ${url.toString()}`);
    }
  }
  /**
   * Check if link should be skipped
   */
  shouldSkipLink(href) {
    return href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("sms:") || href.startsWith("whatsapp:");
  }
  /**
   * Check if link is external
   */
  isExternalLink(href) {
    return href.includes("://") && !href.includes(window.location.hostname);
  }
  /**
   * Check if domain is excluded
   */
  isExcludedDomain(href) {
    if (!this.config.excludedDomains || this.config.excludedDomains.length === 0) {
      return false;
    }
    return this.config.excludedDomains.some((domain) => href.includes(domain));
  }
  /**
   * Observe DOM for new links
   */
  observeNewLinks() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            if (element.tagName === "A") {
              this.addClickListener(element);
            }
            const links = element.querySelectorAll("a");
            links.forEach((link) => {
              this.addClickListener(link);
            });
          }
        });
      });
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
  }
}
export {
  UtmTransfer
};
