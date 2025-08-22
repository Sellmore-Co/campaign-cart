/**
 * Analytics V2 DataLayerManager
 * Core data layer management following Elevar's pattern
 */

import { useAttributionStore } from '@/stores/attributionStore';
import type { 
  DataLayerEvent, 
  DataLayerConfig, 
  EventContext, 
  EventMetadata,
  DataLayerTransformFn,
  DebugOptions 
} from './types';
import { DEFAULT_CONFIG, STORAGE_KEYS, EVENT_VALIDATION_RULES } from './config';
import { pendingEventsHandler } from './tracking/PendingEventsHandler';

declare global {
  interface Window {
    NextDataLayer: DataLayerEvent[];
    NextDataLayerTransformFn?: DataLayerTransformFn;
  }
}

export class DataLayerManager {
  private static instance: DataLayerManager;
  private config: DataLayerConfig;
  private sessionId: string;
  private sequenceNumber: number = 0;
  private debugMode: boolean = false;
  private context: EventContext = {};

  /**
   * Get current context
   */
  public getContext(): EventContext {
    return this.context;
  }

  private constructor(config?: Partial<DataLayerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDataLayer();
    this.sessionId = this.getOrCreateSessionId();
    this.loadDebugMode();
    this.enrichContext();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<DataLayerConfig>): DataLayerManager {
    if (!DataLayerManager.instance) {
      DataLayerManager.instance = new DataLayerManager(config);
    }
    return DataLayerManager.instance;
  }

  /**
   * Initialize window.NextDataLayer array
   */
  private initializeDataLayer(): void {
    if (typeof window === 'undefined') return;

    if (!window.NextDataLayer) {
      window.NextDataLayer = [];
    }

    // Set transform function if provided
    if (this.config.transformFn) {
      window.NextDataLayerTransformFn = this.config.transformFn;
    }
  }

  /**
   * Push event to data layer with validation
   */
  public push(event: DataLayerEvent): void {
    try {
      // Validate event if enabled
      if (this.config.eventValidation && !this.validateEvent(event)) {
        return;
      }

      // Enrich event
      const enrichedEvent = this.enrichEvent(event);

      // Apply transform function if exists
      let finalEvent = enrichedEvent;
      if (window.NextDataLayerTransformFn) {
        const transformed = window.NextDataLayerTransformFn(enrichedEvent);
        if (!transformed) {
          this.debug('Event filtered out by transform function', event);
          return;
        }
        finalEvent = transformed;
      }

      // Check if this event should be queued for after redirect
      const willRedirect = (finalEvent as any)._willRedirect;
      this.debug(`Event ${finalEvent.event} has _willRedirect flag:`, willRedirect);
      delete (finalEvent as any)._willRedirect; // Clean up internal flag
      
      // ONLY queue if there's an actual redirect happening
      if (willRedirect) {
        // Queue the event for processing after redirect
        pendingEventsHandler.queueEvent(finalEvent);
        this.debug(`Event queued for after redirect: ${finalEvent.event}`, finalEvent);
        
        // Don't push to current page's data layer since we're redirecting
        // This prevents duplicate events
        return;
      }

      // Push to data layer
      window.NextDataLayer.push(finalEvent);

      // Log in debug mode
      this.debug('Event pushed to data layer', finalEvent);

      // Notify providers
      this.notifyProviders(finalEvent);

    } catch (error) {
      this.error('Error pushing event to data layer', error, event);
    }
  }

  /**
   * Enable/disable debug mode
   */
  public setDebugMode(enabled: boolean, options?: Partial<DebugOptions>): void {
    this.debugMode = enabled;
    
    if (this.config.debug) {
      this.config.debug = { ...this.config.debug, enabled, ...options };
    }

    // Persist to localStorage if enabled
    if (this.config.debug?.persistInLocalStorage) {
      try {
        localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, JSON.stringify({ enabled, options }));
      } catch (e) {
        console.error('Failed to persist debug mode', e);
      }
    }

    this.debug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current debug mode status
   */
  public isDebugMode(): boolean {
    return this.debugMode;
  }

  /**
   * Invalidate context (for route changes)
   */
  public invalidateContext(): void {
    this.context = {};
    this.enrichContext();
    this.debug('Context invalidated and re-enriched');
  }

  /**
   * Update user properties
   */
  public setUserProperties(properties: Record<string, any>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROPERTIES, JSON.stringify(properties));
      this.debug('User properties updated', properties);
    } catch (e) {
      this.error('Failed to save user properties', e);
    }
  }

  /**
   * Get stored user properties
   */
  public getUserProperties(): Record<string, any> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROPERTIES);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      this.error('Failed to load user properties', e);
      return null;
    }
  }

  /**
   * Clear all data
   */
  public clear(): void {
    window.NextDataLayer = [];
    this.sequenceNumber = 0;
    this.context = {};
    this.enrichContext();
    this.debug('Data layer cleared');
  }

  /**
   * Validate event structure
   */
  private validateEvent(event: DataLayerEvent): boolean {
    // Check required fields
    for (const field of EVENT_VALIDATION_RULES.required) {
      if (!this.getNestedValue(event, field)) {
        this.error(`Missing required field: ${field}`, null, event);
        return false;
      }
    }

    // Check event-specific required fields
    const eventRules = EVENT_VALIDATION_RULES.eventSpecific[event.event as keyof typeof EVENT_VALIDATION_RULES.eventSpecific];
    if (eventRules) {
      for (const field of eventRules) {
        if (!this.getNestedValue(event, field)) {
          this.error(`Missing required field for ${event.event}: ${field}`, null, event);
          return false;
        }
      }
    }

    // Validate field types
    for (const [field, expectedType] of Object.entries(EVENT_VALIDATION_RULES.fieldTypes)) {
      const value = this.getNestedValue(event, field);
      if (value !== undefined && typeof value !== expectedType) {
        this.error(`Invalid type for field ${field}: expected ${expectedType}, got ${typeof value}`, null, event);
        return false;
      }
    }

    return true;
  }

  /**
   * Enrich event with metadata and context
   */
  private enrichEvent(event: DataLayerEvent): DataLayerEvent {
    const metadata: EventMetadata = {
      pushed_at: Date.now(),
      session_id: this.sessionId,
      sequence_number: ++this.sequenceNumber,
      debug_mode: this.debugMode,
      source: 'NextDataLayer',
      version: '0.2.0',
    };

    // Get attribution data
    let attribution: any = {};
    try {
      // Get attribution from store
      const attributionStore = useAttributionStore.getState();
      const attributionData = attributionStore.getAttributionForApi();
      
      // Only include attribution if it has data
      if (attributionData && Object.keys(attributionData).length > 0) {
        attribution = attributionData;
        this.debug('Attribution data added to event:', attribution);
      } else {
        this.debug('Attribution store exists but has no data yet');
      }
    } catch (error) {
      // Attribution store may not be initialized yet
      this.debug('Could not get attribution data:', error);
    }

    const enrichedEvent: DataLayerEvent = {
      ...event,
      _metadata: metadata,
    };
    
    // Only add attribution if it has data
    if (attribution && Object.keys(attribution).length > 0) {
      enrichedEvent.attribution = attribution;
    }

    // Add context if enrichment is enabled
    if (this.config.enrichContext) {
      enrichedEvent.event_time = enrichedEvent.event_time || new Date().toISOString();
      enrichedEvent.event_id = enrichedEvent.event_id || this.generateEventId();
      
      // Merge stored user properties
      const storedUserProperties = this.getUserProperties();
      if (storedUserProperties) {
        enrichedEvent.user_properties = {
          ...storedUserProperties,
          ...enrichedEvent.user_properties,
        };
      }
    }

    return enrichedEvent;
  }

  /**
   * Enrich context information
   */
  private enrichContext(): void {
    if (typeof window === 'undefined') return;

    this.context = {
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      session_id: this.sessionId,
      timestamp: Date.now(),
    };
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
      
      const now = Date.now();
      const sessionTimeout = this.config.sessionTimeout || 30 * 60 * 1000; // 30 minutes

      if (stored && sessionStart && (now - parseInt(sessionStart)) < sessionTimeout) {
        // Update session start time
        localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
        return stored;
      }

      // Create new session
      const newSessionId = this.generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
      localStorage.setItem(STORAGE_KEYS.SESSION_START, now.toString());
      return newSessionId;
    } catch (e) {
      // Fallback to memory-based session
      return this.generateSessionId();
    }
  }

  /**
   * Load debug mode from localStorage
   */
  private loadDebugMode(): void {
    if (!this.config.debug?.persistInLocalStorage) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEBUG_MODE);
      if (stored) {
        const { enabled, options } = JSON.parse(stored);
        this.debugMode = enabled;
        if (options && this.config.debug) {
          this.config.debug = { ...this.config.debug, ...options };
        }
      }
    } catch (e) {
      // Ignore errors loading debug mode
    }
  }

  /**
   * Notify analytics providers
   */
  private notifyProviders(event: DataLayerEvent): void {
    if (!this.config.providers) return;

    for (const provider of this.config.providers) {
      try {
        // Check if provider is a ProviderAdapter instance
        if (typeof provider.isEnabled === 'function') {
          if (provider.isEnabled() && provider.trackEvent) {
            provider.trackEvent(event);
          }
        }
        // Check if provider is a basic AnalyticsProvider config
        else if (provider.enabled !== false && provider.trackEvent) {
          provider.trackEvent(event);
        }
      } catch (error) {
        this.error(`Error in provider ${provider.name || 'unknown'}`, error, event);
      }
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${this.sessionId}_${this.sequenceNumber}_${Date.now()}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Debug logging
   */
  private debug(message: string, data?: any): void {
    if (!this.debugMode || !this.config.debug?.logEvents) return;
    
    const prefix = '[NextDataLayer]';
    if (this.config.debug?.verbose && data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  /**
   * Error logging
   */
  private error(message: string, error: any, data?: any): void {
    if (!this.config.debug?.logErrors) return;
    
    const prefix = '[NextDataLayer ERROR]';
    console.error(`${prefix} ${message}`, { error, data });
  }

  /**
   * Initialize the data layer (called by tracking components)
   */
  public initialize(): void {
    this.initializeDataLayer();
    this.debug('Data layer initialized');
  }

  /**
   * Add a provider to receive events
   */
  public addProvider(provider: any): void {
    if (!this.config.providers) {
      this.config.providers = [];
    }
    this.config.providers.push(provider);
    this.debug(`Provider ${provider.name || 'unknown'} added`);
  }

  /**
   * Set transform function
   */
  public setTransformFunction(fn: DataLayerTransformFn): void {
    window.NextDataLayerTransformFn = fn;
    this.debug('Transform function set');
  }

  /**
   * Get event count for statistics
   */
  public getEventCount(): number {
    return window.NextDataLayer?.length || 0;
  }

  /**
   * Format an ecommerce event
   */
  public formatEcommerceEvent(eventName: string, data: any): DataLayerEvent {
    return {
      event: eventName,
      event_time: new Date().toISOString(),
      data: data.data || data,
      ecommerce: data.ecommerce || data
    };
  }

  /**
   * Format a user data event
   */
  public formatUserDataEvent(userData: any): DataLayerEvent {
    return {
      event: 'dl_user_data',
      event_time: new Date().toISOString(),
      user_properties: userData.user_properties || userData,
      cart_total: userData.cart_total,
      ecommerce: userData.ecommerce
    };
  }
}

// Export singleton instance
export const dataLayer = DataLayerManager.getInstance();