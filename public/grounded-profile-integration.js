/**
 * Profile-aware price fetching for Grounded Sheets
 * This code enhances the existing grounded-footwear.js to work with the profile system
 */

// Enhanced function to get prices from campaign data with profile awareness
function getProfileAwarePrices() {
  try {
    // Check if campaign data exists
    const cacheData = sessionStorage.getItem('next-campaign-cache');
    if (!cacheData) {
      console.log('[Grounded] No cache data found');
      return null;
    }
    
    const cache = JSON.parse(cacheData);
    if (!cache.campaign || !cache.campaign.packages) {
      console.log('[Grounded] No campaign or packages in cache');
      return null;
    }
    
    const packages = cache.campaign.packages;
    
    // Get active profile from sessionStorage
    const profileStoreData = sessionStorage.getItem('next-profile-store');
    let activeProfileId = null;
    let profileMappings = null;
    
    if (profileStoreData) {
      try {
        const profileStore = JSON.parse(profileStoreData);
        activeProfileId = profileStore?.state?.activeProfileId;
        
        // Get profile configuration from window.nextConfig
        if (activeProfileId && window.nextConfig?.profiles?.[activeProfileId]) {
          profileMappings = window.nextConfig.profiles[activeProfileId].packageMappings;
          console.log(`[Grounded] Active profile: ${activeProfileId} with ${Object.keys(profileMappings).length} mappings`);
        }
      } catch (error) {
        console.warn('[Grounded] Could not parse profile store:', error);
      }
    }
    
    const priceMap = {};
    
    // Build a map of variant IDs to prices
    packages.forEach(pkg => {
      if (pkg.ref_id && pkg.price && pkg.price_retail) {
        // If we have an active profile, check for mapped package IDs
        let targetId = pkg.ref_id;
        
        if (profileMappings) {
          // Check if this package ID should be mapped to another
          // The mapping goes from original ID to discounted ID
          // We need to check if any original ID maps to this package
          for (const [originalId, mappedId] of Object.entries(profileMappings)) {
            if (parseInt(originalId) === pkg.ref_id) {
              // This is an original package, get the mapped package
              const mappedPackage = packages.find(p => p.ref_id === mappedId);
              if (mappedPackage) {
                console.log(`[Grounded] Profile mapping: ${pkg.ref_id} -> ${mappedId}`);
                // Use the mapped package's prices
                priceMap[pkg.ref_id] = {
                  salePrice: parseFloat(mappedPackage.price),
                  regularPrice: parseFloat(mappedPackage.price_retail),
                  originalSalePrice: parseFloat(pkg.price),
                  originalRegularPrice: parseFloat(pkg.price_retail),
                  mapped: true,
                  mappedFrom: pkg.ref_id,
                  mappedTo: mappedId
                };
              } else {
                // Mapped package not found, use original
                priceMap[pkg.ref_id] = {
                  salePrice: parseFloat(pkg.price),
                  regularPrice: parseFloat(pkg.price_retail)
                };
              }
            }
          }
        }
        
        // If no mapping was applied, use original prices
        if (!priceMap[pkg.ref_id]) {
          priceMap[pkg.ref_id] = {
            salePrice: parseFloat(pkg.price),
            regularPrice: parseFloat(pkg.price_retail)
          };
        }
      }
    });
    
    console.log('[Grounded] Built profile-aware price map:', priceMap);
    return priceMap;
  } catch (error) {
    console.warn('[Grounded] Could not load profile-aware prices:', error);
    return null;
  }
}

// Enhanced TierController methods
function enhanceTierController() {
  // Store original methods
  const originalRefreshPrices = TierController.prototype.refreshPricesFromCampaign;
  const originalInit = TierController.prototype.init;
  
  // Override refreshPricesFromCampaign to use profile-aware pricing
  TierController.prototype.refreshPricesFromCampaign = function() {
    console.log('[Grounded] Refreshing prices with profile awareness');
    const campaignPrices = getProfileAwarePrices(); // Use profile-aware function
    
    if (campaignPrices) {
      console.log('[Grounded] Found profile-aware campaign prices, updating variants');
      groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, campaignPrices);
      
      // Refresh all dropdowns to show updated prices
      this.populateAllDropdowns();
      
      // Update pricing for all active slots
      for (let i = 1; i <= this.currentTier; i++) {
        this.updateSlotPricing(i);
      }
      
      console.log('[Grounded] Prices refreshed with profile awareness');
    } else {
      console.log('[Grounded] No campaign prices found, using fallback prices');
      groundedSheetsVariants = enhanceVariantsWithPrices(groundedSheetsVariantsOriginal, null);
    }
  };
  
  // Enhanced init to listen for profile changes
  TierController.prototype.init = function() {
    // Call original init
    originalInit.call(this);
    
    // Listen for profile change events
    this.setupProfileListeners();
  };
  
  // New method to setup profile change listeners
  TierController.prototype.setupProfileListeners = function() {
    console.log('[Grounded] Setting up profile change listeners');
    
    // Listen for custom profile events
    document.addEventListener('profile:applied', (event) => {
      console.log('[Grounded] Profile applied event:', event.detail);
      this.handleProfileChange();
    });
    
    document.addEventListener('profile:reverted', (event) => {
      console.log('[Grounded] Profile reverted event:', event.detail);
      this.handleProfileChange();
    });
    
    // Also listen for storage changes (for cross-tab updates)
    window.addEventListener('storage', (event) => {
      if (event.key === 'next-profile-store') {
        console.log('[Grounded] Profile store changed in storage');
        this.handleProfileChange();
      }
    });
    
    // Check for profile changes periodically (fallback)
    this.profileCheckInterval = setInterval(() => {
      this.checkForProfileChanges();
    }, 2000); // Check every 2 seconds
  };
  
  // Handle profile changes
  TierController.prototype.handleProfileChange = function() {
    console.log('[Grounded] Handling profile change');
    
    // Refresh prices with new profile
    this.refreshPricesFromCampaign();
    
    // Trigger UI updates
    this.updateAllSlotPricing();
    
    // Show visual feedback
    this.showProfileChangeNotification();
  };
  
  // Check for profile changes (polling fallback)
  TierController.prototype.checkForProfileChanges = function() {
    const profileStoreData = sessionStorage.getItem('next-profile-store');
    if (profileStoreData) {
      try {
        const profileStore = JSON.parse(profileStoreData);
        const currentProfileId = profileStore?.state?.activeProfileId || 'none';
        
        if (this.lastKnownProfile !== currentProfileId) {
          console.log(`[Grounded] Profile changed from ${this.lastKnownProfile} to ${currentProfileId}`);
          this.lastKnownProfile = currentProfileId;
          this.handleProfileChange();
        }
      } catch (error) {
        // Silent fail for polling
      }
    }
  };
  
  // Update all slot pricing
  TierController.prototype.updateAllSlotPricing = function() {
    console.log('[Grounded] Updating all slot pricing');
    for (let i = 1; i <= this.currentTier; i++) {
      this.updateSlotPricing(i);
    }
  };
  
  // Show notification when profile changes
  TierController.prototype.showProfileChangeNotification = function() {
    const profileStoreData = sessionStorage.getItem('next-profile-store');
    if (!profileStoreData) return;
    
    try {
      const profileStore = JSON.parse(profileStoreData);
      const activeProfileId = profileStore?.state?.activeProfileId;
      
      if (activeProfileId && window.nextConfig?.profiles?.[activeProfileId]) {
        const profile = window.nextConfig.profiles[activeProfileId];
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'profile-change-notification';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        notification.textContent = `✨ ${profile.name} Applied - Prices Updated!`;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
          notification.style.animation = 'slideOut 0.3s ease-out';
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      }
    } catch (error) {
      console.warn('[Grounded] Could not show profile notification:', error);
    }
  };
  
  // Clean up on destroy
  TierController.prototype.destroy = function() {
    if (this.profileCheckInterval) {
      clearInterval(this.profileCheckInterval);
    }
    // Remove event listeners if needed
  };
}

// Initialize when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', enhanceTierController);
} else {
  enhanceTierController();
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('[Grounded] Profile integration loaded');