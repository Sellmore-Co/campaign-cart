/**
 * Analytics V2 Tracking Module
 * Export all tracking components
 */

export { ListAttributionTracker } from './ListAttributionTracker';
export { ViewItemListTracker } from './ViewItemListTracker';
export { UserDataTracker } from './UserDataTracker';
export { AutoEventListener } from './AutoEventListener';
export { PendingEventsHandler } from './PendingEventsHandler';

// Import the classes to use them in the functions
import { ListAttributionTracker } from './ListAttributionTracker';
import { ViewItemListTracker } from './ViewItemListTracker';
import { UserDataTracker } from './UserDataTracker';
import { AutoEventListener } from './AutoEventListener';

// Convenience function to initialize all trackers
export function initializeAllTrackers(): void {
  // Initialize in order of dependencies
  ListAttributionTracker.getInstance(); // Initialize but no explicit init call needed
  const viewTracker = ViewItemListTracker.getInstance();
  const userTracker = UserDataTracker.getInstance();
  const autoListener = AutoEventListener.getInstance();
  
  viewTracker.initialize();
  userTracker.initialize();
  autoListener.initialize();
}

// Convenience function to destroy all trackers
export function destroyAllTrackers(): void {
  const viewTracker = ViewItemListTracker.getInstance();
  const userTracker = UserDataTracker.getInstance();
  const autoListener = AutoEventListener.getInstance();
  
  viewTracker.destroy();
  userTracker.destroy();
  autoListener.destroy();
}