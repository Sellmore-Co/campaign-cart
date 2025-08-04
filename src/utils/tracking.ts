/**
 * Analytics Tracking Utilities
 * Direct exports for clean, modern analytics implementation
 */

export { nextAnalytics as analyticsManager } from '@/utils/analytics/index';
export type { 
  AnalyticsProvider, 
  AnalyticsEvent, 
  AnalyticsConfig,
  TrackingItem,
  EcommerceEvent
} from '@/utils/analytics/types';