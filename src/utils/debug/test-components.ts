/**
 * Debug Components Test
 * Simple test to verify all panel components are working correctly
 */

import {
  CartPanel,
  EventTimelinePanel,
  ConfigPanel,
  CheckoutPanel,
  StoragePanel,
  EnhancedCampaignPanel
} from './panels';

export function testDebugComponents(): boolean {
  try {
    console.log('🧪 Testing debug panel components...');

    // Test that all panels can be instantiated
    const cartPanel = new CartPanel();
    const eventsPanel = new EventTimelinePanel();
    const configPanel = new ConfigPanel();
    const checkoutPanel = new CheckoutPanel();
    const storagePanel = new StoragePanel();
    const campaignPanel = new EnhancedCampaignPanel();

    // Test that all panels have required properties
    const panels = [
      cartPanel,
      eventsPanel,
      configPanel,
      checkoutPanel,
      storagePanel,
      campaignPanel
    ];

    let allValid = true;
    for (const panel of panels) {
      if (!panel.id || !panel.title || !panel.icon) {
        console.error(`❌ Panel missing required properties:`, {
          id: panel.id,
          title: panel.title,
          icon: panel.icon
        });
        allValid = false;
        continue;
      }

      // Test that getContent() returns a string
      try {
        const content = panel.getContent();
        if (typeof content !== 'string') {
          console.error(`❌ Panel ${panel.id} getContent() should return string, got:`, typeof content);
          allValid = false;
        }
      } catch (error) {
        console.error(`❌ Panel ${panel.id} getContent() failed:`, error);
        allValid = false;
      }

      // Test that getActions() returns an array (if method exists)
      if ('getActions' in panel && typeof panel.getActions === 'function') {
        try {
          const actions = panel.getActions();
          if (!Array.isArray(actions)) {
            console.error(`❌ Panel ${panel.id} getActions() should return array, got:`, typeof actions);
            allValid = false;
          }
        } catch (error) {
          console.error(`❌ Panel ${panel.id} getActions() failed:`, error);
          allValid = false;
        }
      }

      console.log(`✅ Panel ${panel.id} (${panel.title}) - OK`);
    }

    if (allValid) {
      console.log('🎉 All debug panel components are working correctly!');
      return true;
    } else {
      console.error('❌ Some debug panel components have issues.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Debug components test failed:', error);
    return false;
  }
}

// Run test if in debug mode
if (typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
  setTimeout(() => {
    testDebugComponents();
  }, 1000);
}