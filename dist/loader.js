/**
 * Campaign Cart SDK Loader
 * Version is controlled by SDK_VERSION constant below
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
  
  // Auto-detect the host from the loader's own URL
  const loaderScript = document.currentScript || document.querySelector('script[src*="loader.js"]');
  const loaderUrl = loaderScript?.src || '';
  
  // Extract version from the loader URL if available (e.g., @v0.2.10)
  let detectedVersion = 'unknown';
  const versionMatch = loaderUrl.match(/@v([0-9]+\.[0-9]+\.[0-9]+(?:-[a-zA-Z0-9]+)?)/);
  if (versionMatch) {
    detectedVersion = versionMatch[1];
  } else if (loaderUrl.includes('localhost') || loaderUrl.includes('127.0.0.1')) {
    // For local development, check for version in query params or use 'dev'
    const urlParams = new URL(loaderUrl).searchParams;
    detectedVersion = urlParams.get('version') || 'dev';
  }
  
  // Extract the base path from loader URL (everything before /loader.js)
  let PROD_HOST;
  if (loaderUrl.includes('jsdelivr.net')) {
    // We're loaded from jsDelivr - use the same path as the loader
    PROD_HOST = loaderUrl.substring(0, loaderUrl.lastIndexOf('/loader.js'));
  } else if (loaderUrl.includes('localhost') || loaderUrl.includes('127.0.0.1') || loaderUrl.includes('file://')) {
    // For local testing, use the local build
    PROD_HOST = loaderUrl.substring(0, loaderUrl.lastIndexOf('/public/loader.js')) + '/dist';
  } else {
    // Fallback to versioned URL
    PROD_HOST = `https://cdn.jsdelivr.net/gh/sellmore-co/campaign-cart@v${detectedVersion}/dist`;
  }
  
  // Store the detected version globally for SDK to use
  window.__NEXT_SDK_VERSION__ = detectedVersion;
  
  const DEV_ENTRY_PATH = '/src/index.ts';
  const PROD_ENTRY_PATH = '/index.js';
  const sdkUrl = isDebug ? DEV_HOST + DEV_ENTRY_PATH : PROD_HOST + PROD_ENTRY_PATH;
  
  // Load config
  if (isDebug) {
    // Dev mode - check if window.nextConfig already exists
    if (!window.nextConfig) {
      // Only load local config if no config is provided on the page
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
      console.log('Using page-provided nextConfig in debug mode');
    }
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
        
        console.log('Next Commerce Campaign-Cart SDK v${detectedVersion} — DEV build loaded');
        console.log(\`Load time: \${loadTime.toFixed(2)}ms\`);
        console.log('Try nextDebug.cartStore() or nextDebug.orderStore()');
      } else {
        console.log('Next Commerce Campaign-Cart SDK v${detectedVersion} — Production loaded');
      }
      
      // Emit ready event
      window.dispatchEvent(new CustomEvent('next:ready', {
        detail: {
          loadTime,
          version: '${detectedVersion}',
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
          console.log('Next Commerce Campaign-Cart SDK v${detectedVersion} — UMD fallback loaded');
          window.dispatchEvent(new CustomEvent('next:ready', {
            detail: {
              fallback: true,
              version: '${detectedVersion}'
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
      console.log('Next Commerce Campaign-Cart SDK v${detectedVersion} — Legacy browser support');
      window.dispatchEvent(new CustomEvent('next:ready', {
        detail: {
          fallback: true,
          version: '${detectedVersion}',
          legacy: true
        }
      }));
    };
    document.head.appendChild(script);
  `;
  
  document.head.appendChild(nomoduleScript);
})();