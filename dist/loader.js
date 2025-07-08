/**
 * Campaign Cart SDK Loaderv v0.2.0
 * Simplified loader that matches existing setup
 */
(function() {
  // Initialize globals (safe to call multiple times)
  window.dataLayer = window.dataLayer || []; // For Google Tag Manager compatibility
  window.nextReady = window.nextReady || [];  // Queue for SDK ready callbacks
  
  // Check for debug mode
  const qs = new URLSearchParams(location.search);
  const isDebug = qs.get('debug') === 'true';
  
  // Configuration
  const DEV_HOST = 'http://localhost:3000';
  const PROD_HOST = 'https://campaign-cart-v2.pages.dev';
  const DEV_ENTRY_PATH = '/src/index.ts';
  const PROD_ENTRY_PATH = '/index.es.js';
  const sdkUrl = isDebug ? DEV_HOST + DEV_ENTRY_PATH : PROD_HOST + PROD_ENTRY_PATH;
  
  // Load config
  if (isDebug) {
    // Dev mode - try both .ts and .js
    const configScript = document.createElement('script');
    configScript.type = 'module';
    configScript.src = DEV_HOST + '/src/config.ts';
    configScript.onerror = () => {
      // Fallback to .js if .ts fails
      const jsConfig = document.createElement('script');
      jsConfig.src = DEV_HOST + '/src/config.js';
      document.head.appendChild(jsConfig);
    };
    document.head.appendChild(configScript);
  } else {
    // Production - check for config
    if (!window.nextConfig) {
      // Check for config URL in data attribute
      const loaderScript = document.currentScript || document.querySelector('script[src*="loader.js"]');
      const configUrl = loaderScript?.getAttribute('data-config-url');
      
      if (configUrl) {
        // Load external config
        const configScript = document.createElement('script');
        configScript.src = configUrl;
        configScript.async = false;
        document.head.appendChild(configScript);
      } else {
        console.warn('No nextConfig found. Please set window.nextConfig before loading the SDK.');
      }
    }
  }
  
  // Preload the SDK module
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = sdkUrl;
  document.head.appendChild(link);
  
  // Load SDK as ES module
  const moduleScript = document.createElement('script');
  moduleScript.type = 'module';
  moduleScript.innerHTML = `
    // Store start time
    window.nextStartTime = performance.now();
    
    try {
      // Import SDK
      const sdk = await import('${sdkUrl}');
      
      // Make SDK available globally
      window.NextCommerce = sdk;
      
      // Performance tracking
      const loadTime = performance.now() - window.nextStartTime;
      
      if (${isDebug}) {
        // Dev mode helpers
        window.nextDebug = {
          loadTime: \`\${loadTime.toFixed(2)}ms\`,
          cartStore: () => import('${DEV_HOST}/src/stores/cartStore.ts')
            .then(m => m.useCartStore.getState()),
          configStore: () => import('${DEV_HOST}/src/stores/configStore.ts')
            .then(m => m.useConfigStore.getState()),
          orderStore: () => import('${DEV_HOST}/src/stores/orderStore.ts')
            .then(m => m.useOrderStore.getState()),
          campaignStore: () => import('${DEV_HOST}/src/stores/campaignStore.ts')
            .then(m => m.useCampaignStore.getState())
        };
        
        console.log('🚀 Next Commerce Campaign-Cart SDKv v0.2.0 — DEV build loaded');
        console.log(\`⚡ Load time: \${loadTime.toFixed(2)}ms\`);
        console.log('💡 Try nextDebug.cartStore() or nextDebug.orderStore()');
      } else {
        console.log('🚀 Next Commerce Campaign-Cart SDKv v0.2.0 — Production loaded');
      }
      
      // Emit ready event
      window.dispatchEvent(new CustomEvent('next:ready', {
        detail: {
          loadTime,
          version: '0.2.0',
          mode: ${isDebug} ? 'development' : 'production'
        }
      }));
      
      // Note: Chunk preloading removed because Vite generates hashed filenames
      // The dynamic imports in src/index.ts handle preloading automatically
      
    } catch (error) {
      console.error('Failed to load SDK:', error);
      
      // Fallback for production only
      if (!${isDebug}) {
        const fallback = document.createElement('script');
        fallback.src = '${PROD_HOST}/index.umd.js';
        fallback.onload = function() {
          console.log('🚀 Next Commerce Campaign-Cart SDKv v0.2.0 — UMD fallback loaded');
          window.dispatchEvent(new CustomEvent('next:ready', {
            detail: {
              fallback: true,
              version: '0.2.0'
            }
          }));
        };
        document.head.appendChild(fallback);
      }
    }
  `;
  
  document.head.appendChild(moduleScript);
  
  // Fallback for browsers that don't support modules
  const nomoduleScript = document.createElement('script');
  nomoduleScript.setAttribute('nomodule', '');
  nomoduleScript.innerHTML = `
    var script = document.createElement('script');
    script.src = '${PROD_HOST}/index.umd.js';
    script.async = true;
    script.onload = function() {
      console.log('🚀 Next Commerce Campaign-Cart SDKv v0.2.0 — Legacy browser support');
      window.dispatchEvent(new CustomEvent('next:ready', {
        detail: {
          fallback: true,
          version: '0.2.0',
          legacy: true
        }
      }));
    };
    document.head.appendChild(script);
  `;
  
  document.head.appendChild(nomoduleScript);
})();