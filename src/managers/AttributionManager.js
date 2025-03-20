/**
 * AttributionManager - Manages attribution data for analytics and tracking
 * 
 * This class is responsible for collecting, storing, and retrieving attribution data
 * from various sources (URL parameters, cookies, localStorage, etc.) and making it
 * available to the application through the state manager.
 */

export class AttributionManager {
  #app;
  #logger;
  #attributionData = {};
  #initialized = false;

  /**
   * Initialize the AttributionManager
   * @param {Object} app - The main application instance
   */
  constructor(app) {
    this.#app = app;
    this.#logger = app.logger.createModuleLogger('ATTRIBUTION');
    this.#init();
  }

  /**
   * Initialize the AttributionManager
   */
  #init() {
    this.#logger.info('Initializing AttributionManager');
    this.#collectAttributionData();
    this.#storeAttributionData();
    this.#setupEventListeners();
    this.#initialized = true;
    this.#logger.info('AttributionManager initialized successfully');
  }

  /**
   * Collect attribution data from various sources
   */
  #collectAttributionData() {
    // Get campaign name for funnel ID from meta tag
    const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
    const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute('data-tag-value') : '';
    
    // Get campaign name if available - preferred method
    const campaignName = this.#app.campaign?.getCampaignName() || this.#app.campaignData?.name || '';
    
    // Use funnel ID from tag if available, otherwise use campaign name
    const funnelId = funnelIdFromTag || campaignName;
    this.#logger.debug(`Using funnel value: ${funnelId} (from ${funnelIdFromTag ? 'meta tag' : 'campaign name'})`);
    
    // Get the affiliate value from affid or aff parameters (in order of priority)
    const affiliate = this.#getStoredValue('affid') || this.#getStoredValue('aff') || '';
    
    // Get Facebook tracking data
    const fbcValue = this.#getCookie('_fbc') || '';
    const fbpValue = this.#getCookie('_fbp') || '';
    
    // Try to get Facebook pixel ID from meta tag or script
    const fbPixelId = this.#getFacebookPixelId();
    
    // Build metadata object for additional tracking data
    const metadata = {
      landing_page: window.location.href || '',
      referrer: document.referrer || '',
      device: navigator.userAgent || '',
      device_type: this.#getDeviceType(),
      timestamp: Date.now(),
      domain: window.location.hostname,
      
      // Facebook tracking data - using the exact variable names from the example
      fb_fbp: fbpValue,
      fb_fbc: fbcValue,
      fb_pixel_id: fbPixelId
    };
    
    // Add fbclid to metadata if it exists
    const fbclid = this.#getStoredValue('fbclid') || '';
    if (fbclid) {
      metadata.fbclid = fbclid;
    }
    
    // Collect all meta tracking tags and add them to metadata
    this.#collectTrackingTags(metadata);

    // Collect UTM parameters and other tracking data
    this.#attributionData = {
      // Attribution API compatible fields
      affiliate: affiliate,
      funnel: funnelId,  // Using funnelId which is either from the meta tag or campaign name
      gclid: this.#getStoredValue('gclid') || '',
      metadata: metadata,
      
      // Standard UTM parameters
      utm_source: this.#getStoredValue('utm_source') || '',
      utm_medium: this.#getStoredValue('utm_medium') || '',
      utm_campaign: this.#getStoredValue('utm_campaign') || '',
      utm_content: this.#getStoredValue('utm_content') || '',
      utm_term: this.#getStoredValue('utm_term') || '',
      
      // Other tracking parameters
      fbclid: fbclid,
      
      // Sub-affiliate parameters (renamed from sub1, sub2, etc.)
      subaffiliate1: this.#getStoredValue('subaffiliate1') || this.#getStoredValue('sub1') || '',
      subaffiliate2: this.#getStoredValue('subaffiliate2') || this.#getStoredValue('sub2') || '',
      subaffiliate3: this.#getStoredValue('subaffiliate3') || this.#getStoredValue('sub3') || '',
      subaffiliate4: this.#getStoredValue('subaffiliate4') || this.#getStoredValue('sub4') || '',
      subaffiliate5: this.#getStoredValue('subaffiliate5') || this.#getStoredValue('sub5') || '',
      
      // Time data
      first_visit_timestamp: this.#getFirstVisitTimestamp(),
      current_visit_timestamp: Date.now()
    };

    this.#logger.debug('Attribution data collected', this.#attributionData);
    
    // Check if we need to update when campaign data becomes available
    if (!campaignName && this.#app.events) {
      this.#logger.debug('Campaign data not available yet, will update when loaded');
    }
  }

  /**
   * Collect all meta tracking tags and add them to metadata object
   * @param {Object} metadata - The metadata object to update
   */
  #collectTrackingTags(metadata) {
    const trackingTags = document.querySelectorAll('meta[name="os-tracking-tag"]');
    this.#logger.debug(`Found ${trackingTags.length} tracking tags`);
    
    trackingTags.forEach(tag => {
      const tagName = tag.getAttribute('data-tag-name');
      const tagValue = tag.getAttribute('data-tag-value');
      const shouldPersist = tag.getAttribute('data-persist') === 'true';
      
      if (tagName && tagValue) {
        metadata[tagName] = tagValue;
        this.#logger.debug(`Added tracking tag: ${tagName} = ${tagValue}`);
        
        // Store in sessionStorage if it should persist
        if (shouldPersist) {
          try {
            sessionStorage.setItem(`os_tag_${tagName}`, tagValue);
            this.#logger.debug(`Persisted tracking tag: ${tagName} = ${tagValue}`);
          } catch (error) {
            this.#logger.error(`Error persisting tracking tag ${tagName}:`, error);
          }
        }
      }
    });
  }

  /**
   * Store attribution data in the state
   */
  #storeAttributionData() {
    if (!this.#app.state) {
      this.#logger.warn('State manager not available, attribution data will not be stored');
      return;
    }

    // Store the complete attribution data
    this.#app.state.setState('cart.attribution', this.#attributionData);
    
    // Also store specific API-compatible attribution object for checkout
    this.#app.state.setState('attribution', this.getAttributionForApi());
    
    this.#logger.info('Attribution data stored in state');
    
    // Also store in localStorage for persistence across sessions
    this.#persistAttributionData();
  }

  /**
   * Persist attribution data to localStorage
   */
  #persistAttributionData() {
    try {
      localStorage.setItem('os_attribution', JSON.stringify(this.#attributionData));
      this.#logger.debug('Attribution data persisted to localStorage');
    } catch (error) {
      this.#logger.error('Error persisting attribution data to localStorage:', error);
    }
  }

  /**
   * Load persisted attribution data from localStorage
   * @returns {Object} The loaded attribution data
   */
  #loadPersistedAttributionData() {
    try {
      const persistedData = localStorage.getItem('os_attribution');
      if (persistedData) {
        return JSON.parse(persistedData);
      }
    } catch (error) {
      this.#logger.error('Error loading attribution data from localStorage:', error);
    }
    return {};
  }

  /**
   * Get the first visit timestamp
   * @returns {number} The timestamp of the first visit
   */
  #getFirstVisitTimestamp() {
    // Try to get from localStorage first
    const persistedData = this.#loadPersistedAttributionData();
    if (persistedData.first_visit_timestamp) {
      return persistedData.first_visit_timestamp;
    }
    
    // Otherwise, use the current timestamp
    return Date.now();
  }

  /**
   * Set up event listeners for page navigation
   */
  #setupEventListeners() {
    // Listen for page changes to update landing page
    window.addEventListener('popstate', () => {
      const metadata = this.#attributionData.metadata || {};
      metadata.landing_page = window.location.href;
      
      this.updateAttributionData({
        metadata: metadata
      });
    });
    
    // Listen for campaign data loading
    if (this.#app.events) {
      this.#app.events.on('campaign.loaded', (data) => {
        if (data && data.campaign) {
          // Get the campaign name using the helper or directly from data
          const campaignName = this.#app.campaign?.getCampaignName() || data.campaign.name || '';
          if (!campaignName) {
            this.#logger.warn('Campaign loaded but name is not available');
            return;
          }
          
          this.#logger.info(`Campaign loaded: ${campaignName}`);
          
          // Get the current funnel from meta tag (if any)
          const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
          const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute('data-tag-value') : '';
          
          // Use the funnel ID from meta tag if available, otherwise use campaign name
          const funnel = funnelIdFromTag || campaignName;
          
          // Update the funnel field
          this.updateAttributionData({
            funnel: funnel
          });
          
          // Also reinitialize the attribution data to ensure it includes latest campaign information
          this.#reinitializeAttributionData();
          
          this.#logger.debug(`Updated funnel to: ${funnel} (from ${funnelIdFromTag ? 'meta tag' : 'campaign name'})`);
        }
      });
      
      // Listen for cart creation events
      this.#app.events.on('prospect.cartCreated', () => {
        const metadata = this.#attributionData.metadata || {};
        metadata.conversion_timestamp = Date.now();
        
        this.updateAttributionData({
          metadata: metadata
        });
        
        this.#logger.debug('Cart created, updated metadata with conversion timestamp');
      });
    }
  }

  /**
   * Reinitialize attribution data after campaign data is loaded
   * This ensures we have the latest campaign information
   */
  #reinitializeAttributionData() {
    this.#logger.info('Reinitializing attribution data with campaign information');
    
    // Get campaign name for funnel ID
    const campaignName = this.#app.campaign?.getCampaignName() || this.#app.campaignData?.name || '';
    
    if (!campaignName) {
      this.#logger.warn('Cannot reinitialize attribution data: Campaign name not available');
      return;
    }
    
    // Get funnel ID from meta tag first
    const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
    const funnelIdFromTag = funnelMetaTag ? funnelMetaTag.getAttribute('data-tag-value') : '';
    
    // Use funnel ID from tag if available, otherwise use campaign name
    const funnelId = funnelIdFromTag || campaignName;
    
    this.#logger.debug(`Using funnel value: ${funnelId} (from ${funnelIdFromTag ? 'meta tag' : 'campaign name'})`);
    
    // Update funnel in attribution data
    this.#attributionData.funnel = funnelId;
    
    // Update the state with this attribution data
    this.#storeAttributionData();
    
    // Log debugging information
    this.#logger.info(`Attribution data reinitialized with funnel: ${funnelId}`);
    
    // Trigger event to notify other components
    if (this.#app.events) {
      this.#app.events.trigger('attribution.updated', {
        attribution: this.#attributionData
      });
    }
  }

  /**
   * Update attribution data with new values
   * @param {Object} newData - New attribution data to merge
   */
  updateAttributionData(newData) {
    // Handle metadata updates specially to merge them instead of replacing
    if (newData.metadata && this.#attributionData.metadata) {
      newData.metadata = {
        ...this.#attributionData.metadata,
        ...newData.metadata
      };
    }
    
    // Special case for funnel - use the new value and log it
    if (newData.funnel) {
      this.#logger.debug(`Updating funnel value to: ${newData.funnel}`);
    }
    
    this.#attributionData = {
      ...this.#attributionData,
      ...newData
    };
    
    this.#storeAttributionData();
    this.#logger.debug('Attribution data updated', newData);
    
    // Trigger event
    if (this.#app.events) {
      this.#app.events.trigger('attribution.updated', {
        attribution: this.#attributionData
      });
    }
  }

  /**
   * Get attribution data
   * @returns {Object} The current attribution data
   */
  getAttributionData() {
    return { ...this.#attributionData };
  }
  
  /**
   * Get attribution data formatted for API
   * @returns {Object} Attribution data formatted for API
   */
  getAttributionForApi() {
    return {
      // Core attribution fields
      affiliate: this.#attributionData.affiliate,
      funnel: this.#attributionData.funnel,
      gclid: this.#attributionData.gclid,
      metadata: this.#attributionData.metadata,
      
      // UTM parameters at root level as required by API
      utm_source: this.#attributionData.utm_source,
      utm_medium: this.#attributionData.utm_medium,
      utm_campaign: this.#attributionData.utm_campaign,
      utm_content: this.#attributionData.utm_content,
      utm_term: this.#attributionData.utm_term,
      
      // Subaffiliate parameters at root level as required by API
      subaffiliate1: this.#attributionData.subaffiliate1,
      subaffiliate2: this.#attributionData.subaffiliate2,
      subaffiliate3: this.#attributionData.subaffiliate3,
      subaffiliate4: this.#attributionData.subaffiliate4,
      subaffiliate5: this.#attributionData.subaffiliate5
    };
  }

  /**
   * Debug method to log attribution data to console
   * Useful for troubleshooting attribution issues
   */
  debug() {
    console.group('AttributionManager Debug Info');
    
    // Check sources for funnel value
    const funnelMetaTag = document.querySelector('meta[name="os-tracking-tag"][data-tag-name="funnel_name"]');
    const funnelFromTag = funnelMetaTag ? funnelMetaTag.getAttribute('data-tag-value') : '';
    const campaignName = this.#app.campaign?.getCampaignName() || this.#app.campaignData?.name || '';
    
    // Show key attribution values first for quick reference
    console.log('Key Attribution Values:');
    console.log('- Affiliate:', this.#attributionData.affiliate);
    console.log('- Funnel:', this.#attributionData.funnel);
    console.log('  • Funnel from meta tag:', funnelFromTag || '(not set)');
    console.log('  • Campaign name:', campaignName || '(not set)');
    console.log('  • Source used:', funnelFromTag ? 'meta tag' : (campaignName ? 'campaign name' : 'none'));
    
    // API formatted data
    console.group('API Formatted Attribution Data (What gets sent to API)');
    const apiData = this.getAttributionForApi();
    
    // Core fields
    console.log('Core Fields:');
    console.log('- affiliate:', apiData.affiliate);
    console.log('- funnel:', apiData.funnel);
    console.log('- gclid:', apiData.gclid);
    
    // UTM parameters
    console.log('UTM Parameters:');
    console.log('- utm_source:', apiData.utm_source);
    console.log('- utm_medium:', apiData.utm_medium);
    console.log('- utm_campaign:', apiData.utm_campaign);
    console.log('- utm_content:', apiData.utm_content);
    console.log('- utm_term:', apiData.utm_term);
    
    // Subaffiliate parameters
    console.log('Subaffiliate Parameters:');
    console.log('- subaffiliate1:', apiData.subaffiliate1);
    console.log('- subaffiliate2:', apiData.subaffiliate2);
    console.log('- subaffiliate3:', apiData.subaffiliate3);
    console.log('- subaffiliate4:', apiData.subaffiliate4);
    console.log('- subaffiliate5:', apiData.subaffiliate5);
    
    // Metadata
    console.group('Metadata Object:');
    console.log('- Domain:', apiData.metadata.domain);
    console.log('- Device (User Agent):', apiData.metadata.device);
    console.log('- Device Type:', apiData.metadata.device_type);
    
    // Facebook data in metadata
    console.log('- Facebook Data:');
    console.log('  - fb_fbp:', apiData.metadata.fb_fbp);
    console.log('  - fb_fbc:', apiData.metadata.fb_fbc);
    console.log('  - fb_pixel_id:', apiData.metadata.fb_pixel_id);
    
    console.log('- Full Metadata:', apiData.metadata);
    console.groupEnd();
    
    console.groupEnd();
    
    // Raw attribution data
    console.log('Raw Attribution Data:', this.#attributionData);
    console.log('URL Parameters:', new URLSearchParams(window.location.search).toString());
    
    // Display tracking tags
    console.group('Tracking Tags');
    const trackingTags = document.querySelectorAll('meta[name="os-tracking-tag"]');
    if (trackingTags.length > 0) {
      trackingTags.forEach(tag => {
        console.log(`${tag.getAttribute('data-tag-name')}: ${tag.getAttribute('data-tag-value')}${tag.getAttribute('data-persist') === 'true' ? ' (persisted)' : ''}`);
      });
    } else {
      console.log('No tracking tags found');
    }
    console.groupEnd();
    
    // Check for the funnel meta tag
    console.log('Funnel Meta Tag:', funnelMetaTag ? {
      exists: true,
      value: funnelMetaTag.getAttribute('data-tag-value')
    } : {
      exists: false
    });
    
    // Campaign data
    console.log('Campaign Name:', this.#app.campaignData?.name || 'Not available');
    
    // Check state data
    if (this.#app.state) {
      console.log('API-formatted State Attribution:', this.#app.state.getState('attribution'));
    }
    
    console.groupEnd();
    
    return 'Attribution debug info logged to console.';
  }

  /**
   * Get a value from URL parameters, sessionStorage, or localStorage
   * @param {string} key - The key to get
   * @returns {string} The value
   */
  #getStoredValue(key) {
    // Try to get from URL parameters first (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(key)) {
      const value = urlParams.get(key);
      
      // Store in sessionStorage for persistence during the session
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        this.#logger.error(`Error storing ${key} in sessionStorage:`, error);
      }
      
      return value;
    }
    
    // Try to get from sessionStorage (second priority)
    try {
      if (sessionStorage.getItem(key)) {
        return sessionStorage.getItem(key);
      }
    } catch (error) {
      this.#logger.error(`Error reading ${key} from sessionStorage:`, error);
    }
    
    // Try to get from localStorage (third priority)
    try {
      if (localStorage.getItem(key)) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      this.#logger.error(`Error reading ${key} from localStorage:`, error);
    }
    
    // Try to get from persisted attribution data (lowest priority)
    const persistedData = this.#loadPersistedAttributionData();
    if (persistedData[key]) {
      return persistedData[key];
    }
    
    return '';
  }

  /**
   * Get a cookie value
   * @param {string} name - The cookie name
   * @returns {string} The cookie value
   */
  #getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }

  /**
   * Get the device type based on user agent
   * @returns {string} The device type
   */
  #getDeviceType() {
    const userAgent = navigator.userAgent;
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  /**
   * Try to detect Facebook Pixel ID from the page
   * @returns {string} The Facebook Pixel ID or empty string if not found
   */
  #getFacebookPixelId() {
    // Try to find FB Pixel ID from meta tag
    const metaPixelId = document.querySelector('meta[name="facebook-domain-verification"]');
    if (metaPixelId) {
      const content = metaPixelId.getAttribute('content');
      if (content && content.includes('=')) {
        const parts = content.split('=');
        if (parts.length > 1) {
          return parts[1];
        }
      }
    }
    
    // Try to find FB Pixel ID from script tags
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const content = script.textContent || '';
      if (content.includes('fbq(') && content.includes('init')) {
        const match = content.match(/fbq\s*\(\s*['"]init['"],\s*['"](\d+)['"]/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return '';
  }
} 