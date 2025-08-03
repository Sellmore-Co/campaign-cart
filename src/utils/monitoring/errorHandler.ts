import { Logger } from '../logger';
import { EventBus } from '../events';

class GlobalErrorHandler {
  private logger = new Logger('ErrorHandler');
  private initialized = false;
  private isHandlingError = false;

  initialize(): void {
    if (this.initialized) return;
    
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: 'unhandledRejection',
        promise: event.promise
      });
    });
    
    // Override console.error to capture errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Prevent recursion - don't capture if we're already handling an error
      if (this.isHandlingError) return;
      
      // Only capture actual Error objects or error-like messages
      const firstArg = args[0];
      if (firstArg instanceof Error) {
        this.handleError(firstArg, { source: 'console.error' });
      } else if (typeof firstArg === 'string' && firstArg.toLowerCase().includes('error')) {
        this.handleError(new Error(firstArg), { 
          source: 'console.error',
          additionalArgs: args.slice(1)
        });
      }
    };
    
    this.initialized = true;
    this.logger.debug('Global error handler initialized');
  }

  handleError(error: Error | any, context?: Record<string, any>): void {
    // Skip null/undefined errors
    if (!error) return;
    
    // Prevent recursive error handling
    if (this.isHandlingError) return;
    
    try {
      this.isHandlingError = true;
      
      // Convert non-Error objects to Error
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Add SDK context
      const enrichedContext = {
        ...context,
        sdk: {
          version: import.meta.env.VITE_APP_VERSION || '0.2.0',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };
      
      // Log locally (this might trigger console.error, but we're protected by isHandlingError flag)
      this.logger.error('Captured error:', errorObj, enrichedContext);
      
      
      // Emit error event
      EventBus.getInstance().emit('error:occurred', {
        message: errorObj.message,
        code: errorObj.name,
        details: enrichedContext
      });
    } finally {
      this.isHandlingError = false;
    }
  }

  captureMessage(_message: string, _level: 'info' | 'warning' | 'error' = 'info'): void {
    // Error tracking removed - add externally via HTML/scripts if needed
  }

  addBreadcrumb(_breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }): void {
    // Error tracking removed - add externally via HTML/scripts if needed
  }
}

export const errorHandler = new GlobalErrorHandler();