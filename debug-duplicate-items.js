// Debug script to monitor cart additions
// Paste this in your browser console to track duplicate additions

(function() {
  const originalAddItem = window.useCartStore?.getState?.()?.addItem;
  
  if (!originalAddItem) {
    console.error('Cart store not found');
    return;
  }
  
  // Track all add attempts
  window.cartDebugLog = [];
  
  // Override addItem to log calls
  window.useCartStore.getState().addItem = async function(item) {
    const timestamp = new Date().toISOString();
    const stackTrace = new Error().stack;
    
    console.group(`🛒 Cart Add Attempt at ${timestamp}`);
    console.log('Package ID:', item.packageId);
    console.log('Is Upsell:', item.isUpsell);
    console.log('Quantity:', item.quantity);
    console.log('Current Cart Items:', window.useCartStore.getState().items.map(i => ({
      packageId: i.packageId,
      quantity: i.quantity
    })));
    console.log('Stack Trace:', stackTrace);
    console.groupEnd();
    
    window.cartDebugLog.push({
      timestamp,
      packageId: item.packageId,
      isUpsell: item.isUpsell,
      quantity: item.quantity,
      stackTrace
    });
    
    // Call original function
    return originalAddItem.call(this, item);
  };
  
  // Monitor enhancer initialization
  const checkEnhancers = () => {
    const toggleElements = document.querySelectorAll('[data-next-toggle]');
    console.log(`Found ${toggleElements.length} toggle elements:`);
    
    toggleElements.forEach((el, index) => {
      const packageId = el.getAttribute('data-next-package-id') || 
                       el.closest('[data-next-package-id]')?.getAttribute('data-next-package-id');
      const isSelected = el.getAttribute('data-next-selected') || 
                        el.closest('[data-next-selected]')?.getAttribute('data-next-selected');
      const isInitialized = el.hasAttribute('data-toggle-initialized');
      
      console.log(`Toggle ${index + 1}:`, {
        packageId,
        isSelected,
        isInitialized,
        element: el
      });
    });
  };
  
  console.log('✅ Cart debug monitoring activated');
  console.log('Run checkEnhancers() to see all toggle elements');
  console.log('View window.cartDebugLog to see all add attempts');
  
  window.checkEnhancers = checkEnhancers;
  
  // Check initial state
  setTimeout(checkEnhancers, 1000);
})();