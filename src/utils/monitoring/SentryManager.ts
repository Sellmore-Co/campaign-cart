import type { ConfigState } from '../../types/global';
import { Logger } from '../logger';

class SentryManager {
  private static instance: SentryManager;
  private initialized = false;
  private sentryLib: any = null;
  private logger = new Logger('SentryManager');

  static getInstance(): SentryManager {
    if (!SentryManager.instance) {
      SentryManager.instance = new SentryManager();
    }
    return SentryManager.instance;
  }

  async initialize(config: ConfigState): Promise<void> {
    if (this.initialized || !config.monitoring?.sentry?.enabled) {
      return;
    }

    try {
      // Dynamically import Sentry to avoid bloating bundle if not used
      const Sentry = await import('@sentry/browser');
      this.sentryLib = Sentry;

      const sentryConfig = config.monitoring.sentry;
      
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment || (config.debug ? 'development' : 'production'),
        release: sentryConfig.release || `campaign-cart@${import.meta.env.VITE_APP_VERSION || '0.2.0'}`,
        
        // Send default PII (user IP, headers) as recommended in sentry.md
        sendDefaultPii: true,
        
        // Performance monitoring
        tracesSampleRate: sentryConfig.tracesSampleRate || (config.debug ? 1.0 : 0.1),
        
        // Distributed tracing configuration
        // Note: Removed campaigns.apps.29next.com due to CORS issues with baggage header
        tracePropagationTargets: sentryConfig.tracePropagationTargets || [
          'localhost'
          // Add other domains here that support the baggage header
        ],
        
        // Session replay
        replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate || 0,
        replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate || 0.1,
        
        // Enable logging as per error-rules.md
        _experiments: {
          enableLogs: true,
        },
        
        // SDK metadata
        beforeSend: (event) => {
          // Add SDK context
          event.tags = {
            ...event.tags,
            sdk_version: import.meta.env.VITE_APP_VERSION || '0.2.0',
            merchant_id: config.apiKey.slice(0, 8), // First 8 chars of API key
            debug_mode: config.debug
          };
          
          // Add custom context
          event.contexts = {
            ...event.contexts,
            campaign_cart: {
              page_type: this.detectPageType(),
              enhancers_loaded: this.getLoadedEnhancers(),
              config_source: (window as any).nextConfig ? 'inline' : 'external'
            }
          };
          
          // Call custom beforeSend if provided
          if (sentryConfig.beforeSend) {
            return sentryConfig.beforeSend(event);
          }
          
          return event;
        },
        
        // Integrations
        integrations: [
          Sentry.browserTracingIntegration(),
          
          // Console logging integration
          Sentry.captureConsoleIntegration({
            levels: ['error', 'warn']
          }),
          
          // Only include Replay if sample rates are set
          ...(sentryConfig.replaysSessionSampleRate || sentryConfig.replaysOnErrorSampleRate
            ? [Sentry.replayIntegration({
                maskAllText: false,
                maskAllInputs: true,
                blockAllMedia: false,
                // Mask sensitive data
                mask: [
                  '[data-next-payment]',
                  '[data-next-cvv]',
                  '[type="password"]'
                ]
              })]
            : [])
        ]
      });
      
      // Set initial user context
      this.setUserContext(config);
      
      this.initialized = true;
      this.logger.debug('Sentry initialized successfully');
      
      // Make Sentry available globally for testing in debug mode
      if (config.debug) {
        (window as any).Sentry = this.sentryLib;
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized || !this.sentryLib) return;
    
    this.sentryLib.captureException(error, {
      extra: context
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized || !this.sentryLib) return;
    
    this.sentryLib.captureMessage(message, level);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): void {
    if (!this.initialized || !this.sentryLib) return;
    
    this.sentryLib.addBreadcrumb(breadcrumb);
  }

  setUserContext(config: ConfigState): void {
    if (!this.initialized || !this.sentryLib) return;
    
    this.sentryLib.setUser({
      id: config.apiKey.slice(0, 8), // Merchant identifier
      merchant_api_key: config.apiKey.slice(0, 8) + '...'
    });
  }

  startSpan<T>(options: {
    op: string;
    name: string;
    attributes?: Record<string, any>;
  }, callback: (span: any) => T | Promise<T>): T | Promise<T> {
    if (!this.initialized || !this.sentryLib) {
      // If Sentry isn't initialized, just run the callback
      return callback(null);
    }
    
    return this.sentryLib.startSpan(options, callback);
  }
  
  // Access to Sentry logger as per error-rules.md
  getLogger(): any {
    if (!this.initialized || !this.sentryLib) return null;
    return this.sentryLib;
  }

  private detectPageType(): string {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('checkout')) return 'checkout';
    if (path.includes('upsell')) return 'upsell';
    if (path.includes('thank')) return 'thank-you';
    if (path.includes('cart')) return 'cart';
    if (path.includes('product')) return 'product';
    
    return 'unknown';
  }

  private getLoadedEnhancers(): string[] {
    // Get list of loaded enhancers from DOM
    const enhancers: string[] = [];
    
    document.querySelectorAll('[data-next-enhanced]').forEach(el => {
      const enhancer = el.getAttribute('data-next-enhanced');
      if (enhancer && !enhancers.includes(enhancer)) {
        enhancers.push(enhancer);
      }
    });
    
    return enhancers;
  }
}

export const sentryManager = SentryManager.getInstance();