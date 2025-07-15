/**
 * Display Formatting System Exports
 * Central export point for all display formatting enhancements
 */

// Core functionality
export { BaseDisplayEnhancer, DisplayFormatter, PropertyResolver } from './DisplayEnhancerCore';
export { ProductDisplayEnhancer } from './ProductDisplayEnhancer';
export { CartDisplayEnhancer } from './CartDisplayEnhancer';
export { SelectionDisplayEnhancer } from './SelectionDisplayEnhancer';
export { OrderDisplayEnhancer } from './OrderDisplayEnhancer';

// Context management
export { DisplayContextProvider, setupContextProviders } from './DisplayContextProvider';
export type { DisplayContext } from './DisplayContextProvider';

// Error handling
export { DisplayErrorBoundary, withErrorBoundary, safeGet } from './DisplayErrorBoundary';
export type { ErrorContext, ErrorHandler } from './DisplayErrorBoundary';

// Debug tools
export { DisplayDebugPanel } from './DisplayDebugPanel';
export { FormatValidator } from './FormatValidator';
export type { ValidationIssue, ValidationReport } from './FormatValidator';

// Types and configuration
export {
  PROPERTY_MAPPINGS,
  getPropertyConfig,
  getPropertyMapping,
  isRawValueProperty,
  isFormattedValueProperty,
  getBasePropertyName,
  supportsExpressions
} from './DisplayEnhancerTypes';

export type {
  FormatType,
  DisplayProperty,
  DisplayValue,
  DisplayState,
  PropertyConfig
} from './DisplayEnhancerTypes';

// Initialize debug tools in development
if (process.env.NODE_ENV === 'development') {
  // Auto-initialize debug panel
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      // Import dynamically to avoid circular dependencies
      import('./DisplayDebugPanel').then(({ DisplayDebugPanel }) => {
        DisplayDebugPanel.init();
        console.log('[Display System] Debug tools initialized. Press Ctrl+Shift+D for debug panel.');
      });
    });
  }
}