/**
 * Analytics V2 Configuration
 * Default settings and provider configurations
 */

import type { DataLayerConfig, DebugOptions, AnalyticsProvider } from './types';

/**
 * Default debug configuration
 */
export const DEFAULT_DEBUG_CONFIG: DebugOptions = {
  enabled: false,
  verbose: false,
  logEvents: true,
  logErrors: true,
  persistInLocalStorage: true,
};

/**
 * Default analytics configuration
 */
export const DEFAULT_CONFIG: DataLayerConfig = {
  debug: DEFAULT_DEBUG_CONFIG,
  providers: [],
  // transformFn: undefined, - omitted to avoid exactOptionalPropertyTypes issue
  enrichContext: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  eventValidation: true,
};

/**
 * Provider settings structure
 */
export const PROVIDER_SETTINGS = {
  // Google Analytics 4
  GA4: {
    name: 'Google Analytics 4',
    requiredConfig: ['measurementId'],
    optionalConfig: ['sendPageView', 'debugMode'],
  },
  // Google Tag Manager
  GTM: {
    name: 'Google Tag Manager',
    requiredConfig: ['containerId'],
    optionalConfig: ['dataLayerName', 'preview', 'auth'],
  },
  // Facebook Pixel
  FACEBOOK: {
    name: 'Facebook Pixel',
    requiredConfig: ['pixelId'],
    optionalConfig: ['autoConfig', 'debugMode'],
  },
  // Segment
  SEGMENT: {
    name: 'Segment',
    requiredConfig: ['writeKey'],
    optionalConfig: ['cdnURL', 'integrations'],
  },
} as const;

/**
 * Event validation rules (GA4 format)
 */
export const EVENT_VALIDATION_RULES = {
  // Required fields for all events
  required: ['event'],

  // Event-specific required fields (GA4 format)
  eventSpecific: {
    // GA4 dl_ events with flat structure
    dl_purchase: ['ecommerce.transaction_id', 'ecommerce.value', 'ecommerce.items'],
    dl_add_to_cart: ['ecommerce.items', 'ecommerce.currency'],
    dl_remove_from_cart: ['ecommerce.items', 'ecommerce.currency'],
    dl_view_item: ['ecommerce.items', 'ecommerce.currency'],
    dl_view_item_list: ['ecommerce.items', 'ecommerce.currency'],
    dl_view_search_results: ['ecommerce.items', 'ecommerce.currency'],
    dl_select_item: ['ecommerce.items', 'ecommerce.currency'],
    dl_begin_checkout: ['ecommerce.items', 'ecommerce.currency'],
    dl_view_cart: ['ecommerce.items', 'ecommerce.currency'],
    dl_add_payment_info: ['ecommerce.currency'],
    dl_add_shipping_info: ['ecommerce.currency'],
    dl_user_data: ['user_properties'], // ecommerce.items is optional for empty cart
    dl_sign_up: ['user_properties'],
    dl_login: ['user_properties'],
    dl_subscribe: ['user_properties', 'lead_type'],
    dl_package_swapped: ['ecommerce.items_removed', 'ecommerce.items_added'],
    dl_upsell_purchase: ['ecommerce.transaction_id', 'ecommerce.value', 'ecommerce.items'],

    // Standard GA4 events (kept for compatibility)
    purchase: ['ecommerce.value', 'ecommerce.items'],
    add_to_cart: ['ecommerce.items'],
    remove_from_cart: ['ecommerce.items'],
    view_item: ['ecommerce.items'],
    view_item_list: ['ecommerce.items'],
    begin_checkout: ['ecommerce.items'],
    add_payment_info: ['ecommerce.value'],
    add_shipping_info: ['ecommerce.value'],
  },
  
  // Field type validations (Elevar format - most values are strings)
  fieldTypes: {
    'event': 'string',
    'event_id': 'string',
    'event_category': 'string',
    'event_label': 'string',
    'cart_total': 'string', // Elevar uses strings for amounts
    'lead_type': 'string',
    'pageType': 'string',
    'ecommerce.currencyCode': 'string',
    'ecommerce.currency': 'string',
    'ecommerce.value': 'number', // GA4 format
    'ecommerce.purchase.actionField.revenue': 'string', // Elevar format
    'ecommerce.purchase.actionField.tax': 'string',
    'ecommerce.purchase.actionField.shipping': 'string',
    'ecommerce.purchase.actionField.sub_total': 'string',
    'ecommerce.purchase.actionField.id': 'string',
    'ecommerce.purchase.actionField.order_name': 'string',
    'user_properties.visitor_type': 'string',
    'user_properties.customer_id': 'string',
    'user_properties.customer_order_count': 'string',
    'user_properties.customer_total_spent': 'string',
  },
};

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  DEBUG_MODE: 'nextDataLayer_debugMode',
  SESSION_ID: 'nextDataLayer_sessionId',
  SESSION_START: 'nextDataLayer_sessionStart',
  USER_PROPERTIES: 'nextDataLayer_userProperties',
} as const;

/**
 * Analytics event names (following GA4 conventions)
 */
export const ANALYTICS_EVENTS = {
  // Ecommerce events
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  
  // User events
  LOGIN: 'login',
  SIGN_UP: 'sign_up',
  
  // Engagement events
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  SHARE: 'share',
  
  // Custom events
  CUSTOM: 'custom_event',
} as const;

/**
 * Get provider configuration by name
 */
export function getProviderConfig(providerName: keyof typeof PROVIDER_SETTINGS): typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS] {
  return PROVIDER_SETTINGS[providerName];
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(provider: AnalyticsProvider, settings: typeof PROVIDER_SETTINGS[keyof typeof PROVIDER_SETTINGS]): boolean {
  if (!provider.config) {
    console.error(`Missing config for provider "${provider.name}"`);
    return false;
  }
  
  // Check required fields
  for (const field of settings.requiredConfig) {
    if (!provider.config[field]) {
      console.error(`Missing required field "${field}" for provider "${provider.name}"`);
      return false;
    }
  }
  
  return true;
}