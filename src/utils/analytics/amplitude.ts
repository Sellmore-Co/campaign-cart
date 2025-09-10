/**
 * Amplitude Analytics Module for 29Next SDK
 * Internal analytics for SDK health monitoring
 */

import { createLogger } from '@/utils/logger';
import { useConfigStore } from '@/stores/configStore';
import { useCampaignStore } from '@/stores/campaignStore';
import { useAttributionStore } from '@/stores/attributionStore';

// Lazy-loaded Amplitude instance
let amplitudeInstance: any = null;
let initializationPromise: Promise<void> | null = null;
let eventQueue: Array<{ name: string; properties: any }> = [];

const logger = createLogger('AmplitudeAnalytics');

// Amplitude configuration - Internal use only
const AMPLITUDE_API_KEY = '4686fc7f03573edc48645829fe0f99fd';
const AMPLITUDE_CONFIG = {
  autocapture: {
    attribution: true,
    fileDownloads: false,
    formInteractions: false,
    pageViews: false,
    sessions: true,
    elementInteractions: false,
    networkTracking: false, // Disable - it breaks fetch calls
    webVitals: true,
    frustrationInteractions: false
  },
  defaultTracking: {
    sessions: true,
    pageViews: false, // We'll track custom page_view events
    formInteractions: false, // We'll track custom checkout events
    fileDownloads: false
  },
  minIdLength: 5,
  trackingOptions: {
    ipAddress: false, // Privacy
    carrier: false
  }
};

/**
 * Hash API key for privacy
 */
function hashApiKey(apiKey: string): string {
  if (!apiKey) return 'unknown';
  try {
    // Simple hash function for browser
    let hash = 0;
    for (let i = 0; i < apiKey.length; i++) {
      const char = apiKey.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  } catch {
    return 'hash_error';
  }
}

/**
 * Get device type
 */
function getDeviceType(): string {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get browser name
 */
function getBrowserName(): string {
  const agent = navigator.userAgent.toLowerCase();
  if (agent.includes('chrome')) return 'chrome';
  if (agent.includes('firefox')) return 'firefox';
  if (agent.includes('safari')) return 'safari';
  if (agent.includes('edge')) return 'edge';
  return 'unknown';
}

/**
 * Get OS name
 */
function getOS(): string {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'macos';
  if (platform.includes('linux')) return 'linux';
  if (/android|webos|iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return /android/i.test(navigator.userAgent) ? 'android' : 'ios';
  }
  return 'unknown';
}

/**
 * Detect page type from URL
 */
function detectPageType(): string {
  const path = window.location.pathname.toLowerCase();
  const hasRefId = new URLSearchParams(window.location.search).has('ref_id');
  
  if (hasRefId) return 'upsell';
  if (path.includes('checkout')) return 'checkout';
  if (path.includes('cart')) return 'cart';
  if (path.includes('product')) return 'product';
  if (path.includes('thank') || path.includes('confirm')) return 'thankyou';
  if (path === '/' || path.includes('home')) return 'landing';
  
  return 'unknown';
}

/**
 * Get all next- prefixed meta tags
 */
function getAllNextMetaTags(): Record<string, string> {
  const metaTags: Record<string, string> = {};
  
  // Get all meta tags that start with "next-"
  const allMetaTags = document.querySelectorAll('meta[name^="next-"]');
  
  allMetaTags.forEach(tag => {
    const name = tag.getAttribute('name');
    const content = tag.getAttribute('content');
    
    if (name && content) {
      // Remove "next-" prefix and convert to underscore format
      // e.g., "next-page-type" becomes "page_type"
      const cleanName = name.replace('next-', '').replace(/-/g, '_');
      metaTags[cleanName] = content;
    }
  });
  
  return metaTags;
}

/**
 * Get core properties for all events
 */
function getCoreProperties(): Record<string, any> {
  const configStore = useConfigStore.getState();
  const campaignStore = useCampaignStore.getState();
  const attributionStore = useAttributionStore.getState();
  const urlParams = new URLSearchParams(window.location.search);
  
  // Create stable session ID (persists for the page session)
  if (!(window as any).__amplitude_session_id) {
    (window as any).__amplitude_session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Get all next- meta tags
  const nextMetaTags = getAllNextMetaTags();
  
  return {
    // Required
    domain: window.location.hostname,
    page_url: window.location.href,
    page_path: window.location.pathname,
    sdk_version: (window as any).__NEXT_SDK_VERSION__ || 'unknown',
    api_key: configStore.apiKey || 'unknown', // Send actual API key - it's public
    api_key_hash: hashApiKey(configStore.apiKey), // Keep hash for backwards compatibility
    session_id: (window as any).__amplitude_session_id,
    timestamp: Date.now(),
    
    // Config data
    debug_mode: configStore.debug,
    currency_behavior: (configStore as any).currencyBehavior || 'auto',
    analytics_enabled: configStore.analytics?.enabled || false,
    tracking_mode: (configStore as any).tracking || 'auto',
    default_country: configStore.addressConfig?.defaultCountry || 'US',
    
    // Campaign data
    campaign_id: (campaignStore.data as any)?.id || null,
    campaign_name: campaignStore.data?.name || null,
    campaign_currency: campaignStore.data?.currency || null,
    from_cache: campaignStore.isFromCache || false,
    
    // Meta tags - spread all next- prefixed meta tags
    ...Object.keys(nextMetaTags).reduce((acc, key) => {
      acc[`meta_${key}`] = nextMetaTags[key] as string;
      return acc;
    }, {} as Record<string, string>),
    
    // Page detection (for comparison with meta)
    page_type_detected: detectPageType(),
    
    // Attribution
    funnel_attribution: attributionStore.funnel || null,
    
    // URL parameters
    ref_id: urlParams.get('ref_id') || null,
    has_utm: !!(attributionStore.utm_source || attributionStore.utm_medium || attributionStore.utm_campaign),
    utm_source: attributionStore.utm_source || null,
    utm_medium: attributionStore.utm_medium || null,
    utm_campaign: attributionStore.utm_campaign || null,
    
    // Environment
    user_agent: navigator.userAgent,
    screen_width: window.screen.width,
    screen_height: window.screen.height
  };
}

/**
 * Initialize Amplitude (lazy loaded)
 */
async function initializeAmplitude(): Promise<void> {
  if (amplitudeInstance) return;
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      logger.debug('Initializing Amplitude analytics...');
      
      // Delay initialization slightly to avoid interfering with SDK startup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Dynamically import Amplitude to avoid blocking SDK initialization
      const amplitude = await import(
        /* webpackChunkName: "amplitude" */
        '@amplitude/analytics-browser'
      );
      
      // Initialize Amplitude with error boundary
      try {
        amplitude.init(AMPLITUDE_API_KEY, undefined, AMPLITUDE_CONFIG);
        amplitudeInstance = amplitude;
      } catch (initError) {
        logger.warn('Amplitude init failed, continuing without analytics:', initError);
        return;
      }
      
      // Don't set user ID - let Amplitude handle it automatically
      // Just set some properties for grouping if needed
      const configStore = useConfigStore.getState();
      if (configStore.apiKey) {
        const identify = new amplitude.Identify();
        identify.set('api_key_hash', hashApiKey(configStore.apiKey));
        identify.set('domain', window.location.hostname);
        identify.set('sdk_version', (window as any).__NEXT_SDK_VERSION__ || 'unknown');
        amplitude.identify(identify);
      }
      
      // Flush queued events with error handling
      if (eventQueue.length > 0) {
        logger.debug(`Flushing ${eventQueue.length} queued events`);
        for (const event of eventQueue) {
          try {
            amplitude.track(event.name, {
              ...getCoreProperties(),
              ...event.properties
            });
          } catch (trackError) {
            logger.debug('Failed to track queued event:', trackError);
          }
        }
        eventQueue = [];
      }
      
      logger.debug('Amplitude initialized successfully');
    } catch (error) {
      logger.warn('Failed to initialize Amplitude:', error);
      initializationPromise = null; // Allow retry
      // Don't throw - analytics should never break the SDK
    }
  })();
  
  return initializationPromise;
}

/**
 * Track an event to Amplitude
 */
export async function trackEvent(eventName: string, properties: Record<string, any> = {}): Promise<void> {
  try {
    // Always track internally for debugging
    logger.debug(`Track event: ${eventName}`, properties);
    
    // Don't initialize Amplitude for the first few seconds to avoid interfering with SDK
    const timeSincePageLoad = Date.now() - ((window as any).__sdk_page_load_time || Date.now());
    if (timeSincePageLoad < 2000) {
      // Queue for later
      eventQueue.push({ name: eventName, properties });
      // Schedule initialization after SDK is stable
      setTimeout(() => initializeAmplitude(), 2000 - timeSincePageLoad);
      return;
    }
    
    // Initialize Amplitude if not already done
    if (!amplitudeInstance && !initializationPromise) {
      // Queue event and initialize
      eventQueue.push({ name: eventName, properties });
      await initializeAmplitude();
      return;
    }
    
    // If initializing, queue the event
    if (initializationPromise && !amplitudeInstance) {
      eventQueue.push({ name: eventName, properties });
      return;
    }
    
    // Send to Amplitude if initialized
    if (amplitudeInstance) {
      try {
        amplitudeInstance.track(eventName, {
          ...getCoreProperties(),
          ...properties
        });
      } catch (trackError) {
        logger.debug('Amplitude track failed:', trackError);
      }
    }
  } catch (error) {
    logger.debug('Failed to track event:', error);
    // Don't throw - analytics should never break the SDK
  }
}

// Set page load time
if (typeof window !== 'undefined') {
  (window as any).__sdk_page_load_time = Date.now();
}

/**
 * Track page view
 */
export async function trackPageView(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const attributionStore = useAttributionStore.getState();
  
  await trackEvent('page_view', {
    page_type: detectPageType(),
    has_ref_id: urlParams.has('ref_id'),
    utm_source: attributionStore.utm_source || null,
    utm_medium: attributionStore.utm_medium || null,
    utm_campaign: attributionStore.utm_campaign || null,
    referrer: document.referrer || null,
    device_type: getDeviceType(),
    browser: getBrowserName(),
    os: getOS()
  });
}

/**
 * Track SDK initialization
 */
export async function trackSDKInitialized(data: {
  initializationTime: number;
  campaignLoadTime: number;
  fromCache: boolean;
  retryAttempts: number;
  elementsEnhanced: number;
  debugMode: boolean;
  forcePackageId?: string | null;
  forceShippingId?: string | null;
}): Promise<void> {
  await trackEvent('sdk_initialized', {
    initialization_time_ms: data.initializationTime,
    campaign_load_time_ms: data.campaignLoadTime,
    from_cache: data.fromCache,
    retry_attempts: data.retryAttempts,
    elements_enhanced: data.elementsEnhanced,
    debug_mode: data.debugMode,
    force_package_id: data.forcePackageId || null,
    force_shipping_id: data.forceShippingId || null
  });
}

/**
 * Track SDK initialization failure
 */
export async function trackSDKInitializationFailed(data: {
  errorMessage: string;
  errorStage: 'config_load' | 'campaign_load' | 'dom_scan' | 'attribution';
  retryAttempt: number;
}): Promise<void> {
  await trackEvent('sdk_initialization_failed', {
    error_message: data.errorMessage,
    error_stage: data.errorStage,
    retry_attempt: data.retryAttempt
  });
}

/**
 * Track campaign loaded
 */
export async function trackCampaignLoaded(data: {
  loadTime: number;
  fromCache: boolean;
  cacheAge?: number;
  packageCount: number;
  shippingMethodsCount: number;
  currency: string;
}): Promise<void> {
  await trackEvent('campaign_loaded', {
    load_time_ms: data.loadTime,
    from_cache: data.fromCache,
    cache_age_ms: data.cacheAge || null,
    package_count: data.packageCount,
    shipping_methods_count: data.shippingMethodsCount,
    currency: data.currency
  });
}

/**
 * Track campaign load failure
 */
export async function trackCampaignLoadFailed(data: {
  errorType: 'network' | 'auth' | 'timeout' | 'invalid_response';
  statusCode?: number;
  retryCount: number;
}): Promise<void> {
  await trackEvent('campaign_load_failed', {
    error_type: data.errorType,
    status_code: data.statusCode || null,
    retry_count: data.retryCount
  });
}

/**
 * Track API call
 */
export async function trackAPICall(data: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestType: 'campaign' | 'cart' | 'order' | 'upsell' | 'prospect_cart';
  success: boolean;
  errorMessage?: string;
  errorType?: 'network' | 'rate_limit' | 'auth' | 'server_error' | 'client_error';
  retryAfter?: number;
}): Promise<void> {
  await trackEvent('api_call', {
    endpoint: data.endpoint,
    method: data.method,
    status_code: data.statusCode,
    response_time_ms: data.responseTime,
    request_type: data.requestType,
    success: data.success,
    error_message: data.errorMessage || null,
    error_type: data.errorType || null,
    retry_after: data.retryAfter || null
  });
}

/**
 * Track cart loaded
 */
export async function trackCartLoaded(data: {
  itemsCount: number;
  cartValue: number;
  loadTime: number;
  fromStorage: boolean;
}): Promise<void> {
  await trackEvent('cart_loaded', {
    items_count: data.itemsCount,
    cart_value: data.cartValue,
    load_time_ms: data.loadTime,
    from_storage: data.fromStorage
  });
}

/**
 * Track checkout events
 */
export async function trackCheckoutStarted(data: {
  cartValue: number;
  itemsCount: number;
  detectedCountry: string;
  paymentMethod: string;
  cartItems?: Array<{
    product_id: number | string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    sku?: string;
  }>;
}): Promise<void> {
  await trackEvent('checkout_started', {
    cart_value: data.cartValue,
    items_count: data.itemsCount,
    detected_country: data.detectedCountry,
    payment_method: data.paymentMethod,
    // Include cart items as array for Amplitude cart analysis
    products: data.cartItems || []
  });
}

export async function trackCheckoutSubmitted(data: {
  cartValue: number;
  itemsCount: number;
  country: string;
  paymentMethod: string;
  timeOnPage: number;
  state?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  sameAsShipping?: boolean;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingPostalCode?: string;
  cartItems?: Array<{
    product_id: number | string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    sku?: string;
  }>;
}): Promise<void> {
  await trackEvent('checkout_submitted', {
    cart_value: data.cartValue,
    items_count: data.itemsCount,
    country: data.country,
    state: data.state || null,
    city: data.city || null,
    postal_code: data.postalCode || null,
    email: data.email || null,
    payment_method: data.paymentMethod,
    time_on_page_ms: data.timeOnPage,
    same_as_shipping: data.sameAsShipping !== undefined ? data.sameAsShipping : true,
    billing_country: data.billingCountry || null,
    billing_state: data.billingState || null,
    billing_city: data.billingCity || null,
    billing_postal_code: data.billingPostalCode || null,
    // Include cart items as array for Amplitude cart analysis
    products: data.cartItems || []
  });
}

export async function trackCheckoutValidationFailed(data: {
  validationErrors: string[];
  errorCount: number;
  firstErrorField: string;
  country: string;
  paymentMethod: string;
  errorDetails?: Record<string, { value: any; error: string; category?: string; errorType?: string }>;
  formValues?: Record<string, any>;
  errorsByCategory?: Record<string, string[]>;
}): Promise<void> {
  // Convert error details to array format for Amplitude cart analysis
  const errorDetailsArray = data.errorDetails 
    ? Object.entries(data.errorDetails).map(([field, details]) => ({
        field_name: field,
        field_value: details.value,
        error_message: details.error,
        error_category: details.category || 'unknown',
        error_type: details.errorType || 'unknown'
      }))
    : [];

  // Convert validation errors to object array format
  const validationErrorsArray = data.validationErrors.map((field, index) => ({
    field_name: field,
    error_position: index + 1,
    is_first_error: index === 0
  }));

  // Convert errors by category to array format
  const errorsByCategoryArray = data.errorsByCategory 
    ? Object.entries(data.errorsByCategory).flatMap(([category, fields]) => 
        fields.map(field => ({
          category: category,
          field_name: field
        }))
      )
    : [];

  // Convert form values to array format for better analysis
  const formFieldsArray = data.formValues
    ? Object.entries(data.formValues).map(([field, value]) => ({
        field_name: field,
        has_value: value !== null && value !== undefined && value !== '',
        value_type: typeof value
      }))
    : [];

  await trackEvent('checkout_validation_failed', {
    // Keep simple properties
    error_count: data.errorCount,
    first_error_field: data.firstErrorField,
    country: data.country,
    payment_method: data.paymentMethod,
    
    // Use array formats for Amplitude cart analysis feature
    validation_errors: validationErrorsArray,  // Array of error objects
    error_details: errorDetailsArray,          // Array of detailed error info
    errors_by_category: errorsByCategoryArray, // Array of category-field pairs
    form_fields: formFieldsArray               // Array of form field states
  });
}

export async function trackCheckoutCompleted(data: {
  orderRefId: string;
  orderValue: number;
  itemsCount: number;
  country: string;
  paymentMethod: string;
  timeToComplete: number;
  state?: string;
  city?: string;
  postalCode?: string;
  email?: string;
  sameAsShipping?: boolean;
  billingCountry?: string;
  billingState?: string;
  billingCity?: string;
  billingPostalCode?: string;
  orderItems?: Array<{
    product_id: number | string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    sku?: string;
  }>;
}): Promise<void> {
  await trackEvent('checkout_completed', {
    order_ref_id: data.orderRefId,
    order_value: data.orderValue,
    items_count: data.itemsCount,
    country: data.country,
    state: data.state || null,
    city: data.city || null,
    postal_code: data.postalCode || null,
    email: data.email || null,
    payment_method: data.paymentMethod,
    time_to_complete_ms: data.timeToComplete,
    same_as_shipping: data.sameAsShipping !== undefined ? data.sameAsShipping : true,
    billing_country: data.billingCountry || null,
    billing_state: data.billingState || null,
    billing_city: data.billingCity || null,
    billing_postal_code: data.billingPostalCode || null,
    // Include order items as array for Amplitude cart analysis
    products: data.orderItems || []
  });
}

export async function trackCheckoutFailed(data: {
  errorMessage: string;
  errorType: 'payment' | 'api' | 'validation' | 'network' | 'unknown';
  paymentResponseCode?: string;
  cartValue: number;
  itemsCount: number;
  country: string;
  paymentMethod: string;
  timeOnPage: number;
}): Promise<void> {
  await trackEvent('checkout_failed', {
    error_message: data.errorMessage,
    error_type: data.errorType,
    payment_response_code: data.paymentResponseCode || null,
    cart_value: data.cartValue,
    items_count: data.itemsCount,
    country: data.country,
    payment_method: data.paymentMethod,
    time_on_page_ms: data.timeOnPage
  });
}

/**
 * Track empty cart checkout attempt
 */
export async function trackEmptyCartCheckoutAttempt(data: {
  paymentMethod: string;
  buttonLocation?: string;
}): Promise<void> {
  await trackEvent('empty_cart_checkout_attempt', {
    payment_method: data.paymentMethod,
    button_location: data.buttonLocation || 'express_checkout'
  });
}

/**
 * Track duplicate order prevention
 */
export async function trackDuplicateOrderPrevention(data: {
  orderRefId: string;
  orderNumber: string;
  userAction: 'close' | 'back';
  timeOnPage?: number;
}): Promise<void> {
  await trackEvent('duplicate_order_prevention', {
    order_ref_id: data.orderRefId,
    order_number: data.orderNumber,
    user_action: data.userAction,
    time_on_page_ms: data.timeOnPage || null
  });
}

/**
 * Track upsell events
 */
export async function trackUpsellPageView(data: {
  orderRefId: string;
  upsellPackageIds: number[];
  orderValue: number;
  upsellsCompleted: string[];
}): Promise<void> {
  // Convert upsell package IDs to object array for better analysis
  const upsellPackagesArray = data.upsellPackageIds.map((id, index) => ({
    package_id: id,
    display_order: index + 1
  }));

  // Convert completed upsells to object array
  const completedUpsellsArray = data.upsellsCompleted.map((id, index) => ({
    upsell_id: id,
    completion_order: index + 1
  }));

  await trackEvent('upsell_page_view', {
    order_ref_id: data.orderRefId,
    order_value: data.orderValue,
    // Use array formats for Amplitude cart analysis
    upsell_packages: upsellPackagesArray,
    completed_upsells: completedUpsellsArray
  });
}

export async function trackUpsellAction(data: {
  action: 'accepted' | 'declined';
  packageId: number;
  packageValue: number;
  orderRefId: string;
  newOrderTotal?: number;
}): Promise<void> {
  await trackEvent('upsell_action', {
    action: data.action,
    package_id: data.packageId,
    package_value: data.packageValue,
    order_ref_id: data.orderRefId,
    new_order_total: data.newOrderTotal || null
  });
}

// Export utilities
export const AmplitudeAnalytics = {
  trackEvent,
  trackPageView,
  trackSDKInitialized,
  trackSDKInitializationFailed,
  trackCampaignLoaded,
  trackCampaignLoadFailed,
  trackAPICall,
  trackCartLoaded,
  trackCheckoutStarted,
  trackCheckoutSubmitted,
  trackCheckoutValidationFailed,
  trackCheckoutCompleted,
  trackCheckoutFailed,
  trackEmptyCartCheckoutAttempt,
  trackDuplicateOrderPrevention,
  trackUpsellPageView,
  trackUpsellAction
};