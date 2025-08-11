import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
// import legacy from '@vitejs/plugin-legacy'; // Optional - uncomment if you need legacy browser support

// Shared configurations to avoid duplication
const sharedResolve = {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@/types': resolve(__dirname, 'src/types'),
    '@/utils': resolve(__dirname, 'src/utils'),
    '@/stores': resolve(__dirname, 'src/stores'),
    '@/enhancers': resolve(__dirname, 'src/enhancers'),
    '@/api': resolve(__dirname, 'src/api'),
    '@/core': resolve(__dirname, 'src/core'),
  },
};

const sharedDefine = {
  __VERSION__: JSON.stringify(process.env.npm_package_version || '0.2.0'),
  'process.env.NODE_ENV': '"production"',
  'process.env': '{}',
  global: 'globalThis',
};

// Terser options for consistency
const terserOptions = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.debug'],
    passes: 2, // Run compress passes twice for better optimization
  },
  format: {
    comments: false,
  },
  mangle: {
    safari10: true,
    properties: {
      regex: /^_/, // Mangle properties starting with _
    },
  },
};

export default defineConfig({
  plugins: [
    // TypeScript declarations
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
      copyDtsFiles: true,
      compilerOptions: {
        removeComments: true,
      },
    }),

    // Compression for better performance
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    // Legacy browser support (optional - uncomment if needed)
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    //   additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    //   renderLegacyChunks: true,
    //   polyfills: {
    //     'es.promise.finally': true,
    //     'es/map': true,
    //     'es/set': true,
    //   },
    // }),

    // Bundle analyzer - only enabled when --analyze flag is passed
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
      sourcemap: true,
    }),

    // Custom plugin for additional builds
    {
      name: 'build-additional-formats',
      async closeBundle() {
        const { build } = await import('vite');
        
        // Build UMD bundle
        await build({
          configFile: false,
          resolve: sharedResolve,
          define: sharedDefine,
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/index.ts'),
              name: 'NextCommerce',
              formats: ['umd'],
              fileName: () => 'index.umd.js',
            },
            rollupOptions: {
              external: [
                // More specific external patterns
                resolve(__dirname, 'src/config.ts'),
                (id: string) => /node_modules/.test(id) && !/vite/.test(id),
              ],
              output: {
                globals: {
                  // Add any global mappings here
                },
                inlineDynamicImports: true,
              },
            },
            minify: 'terser',
            terserOptions,
            sourcemap: false,
            target: 'es2015', // UMD should support older browsers
          },
        } as UserConfig);
      }
    }
  ].filter(Boolean),

  resolve: sharedResolve,
  define: sharedDefine,

  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      // Add your frequently used dependencies here
      // 'react', 'react-dom', 'axios', etc.
    ],
    exclude: [
      // Exclude large or optional dependencies
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },

  build: {
    // Increase chunk size warning limit slightly
    chunkSizeWarningLimit: 600,
    
    // Enable compressed size reporting
    reportCompressedSize: true,
    
    // CSS configuration
    cssMinify: true, // Use default minifier (or 'lightningcss' if you install it)
    cssCodeSplit: false,
    
    // Module preload polyfill
    modulePreload: {
      polyfill: true,
    },
    
    // Library configuration
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        // Add the styles as a separate entry
        styles: resolve(__dirname, 'src/styles.ts'),
      },
      name: 'NextCommerce',
      fileName: (format, entryName) => {
        if (entryName === 'styles') {
          return `${entryName}.${format}.js`;
        }
        return `${entryName}.${format}.js`;
      },
      formats: ['es'],
    },
    
    rollupOptions: {
      external: [
        // More specific external configuration
        /src\/config\.ts$/,
      ],
      
      output: {
        // Choose either preserveModules OR manualChunks, not both
        // Option 1: Use manual chunks (recommended for better control)
        manualChunks: (id: string) => {
          // Split node_modules into vendor chunk
          if (id.includes('node_modules')) {
            // Further split large libraries
            if (id.includes('lodash')) {
              return 'vendor-lodash';
            }
            if (id.includes('date-fns')) {
              return 'vendor-date';
            }
            return 'vendor';
          }
          
          // Split utilities into separate chunk
          if (id.includes('/utils/') || id.includes('/helpers/')) {
            return 'utils';
          }
          
          // Split API layer
          if (id.includes('/api/')) {
            return 'api';
          }
        },
        
        // Option 2: If you prefer preserveModules, comment out manualChunks above and uncomment these:
        // preserveModules: true,
        // preserveModulesRoot: 'src',
        
        // Better file naming for caching
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Extract CSS with proper naming
          if (assetInfo.name === 'style.css' || assetInfo.name?.endsWith('.css')) {
            return 'campaign-cart.css';
          }
          // Other assets
          const extType = assetInfo.name?.split('.').at(-1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return 'images/[name]-[hash][extname]';
          }
          if (/woff2?|ttf|otf|eot/i.test(extType || '')) {
            return 'fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        
        // Optimize globals
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        
        // Advanced options
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
          arrowFunctions: true,
        },
        
        // Don't inline dynamic imports for better code splitting
        inlineDynamicImports: false,
      },
      
      // Tree-shaking optimizations
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    
    // Source maps only for debugging builds
    sourcemap: process.env.DEBUG === 'true' ? 'inline' : false,
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Inline assets smaller than 4kb
    assetsInlineLimit: 4096,
    
    // Output directory
    outDir: 'dist',
    
    // Empty output directory before build
    emptyOutDir: true,
    
    // Improve build performance
    minify: 'terser',
    terserOptions,
  },

  // Development server configuration
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    hmr: {
      overlay: true,
      clientPort: 3000,
    },
    open: 'http://next-staging-core.webflow.io/playground?debugger=true&debug=true',
    cors: {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    // Optimize dependency pre-bundling
    warmup: {
      clientFiles: ['./src/index.ts'],
    },
  },
  
  // Public directory for serving static files (including debug files)
  publicDir: 'public',

  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    cors: true,
  },

  // Performance optimizations
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },

  // JSON handling
  json: {
    namedExports: true,
    stringify: false,
  },
} as UserConfig);