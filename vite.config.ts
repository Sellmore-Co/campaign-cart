import { defineConfig, build } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      insertTypesEntry: true,
    }),
    // Bundle analyzer - only enabled when --analyze flag is passed
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // or 'sunburst', 'network', 'raw-data', 'list'
    }),
    {
      name: 'build-umd-and-css',
      async closeBundle() {
        // Build UMD bundle separately (without code splitting)
        const { build } = await import('vite');
        await build({
          configFile: false,
          resolve: {
            alias: {
              '@': resolve(__dirname, 'src'),
              '@/types': resolve(__dirname, 'src/types'),
              '@/utils': resolve(__dirname, 'src/utils'),
              '@/stores': resolve(__dirname, 'src/stores'),
              '@/enhancers': resolve(__dirname, 'src/enhancers'),
              '@/api': resolve(__dirname, 'src/api'),
              '@/core': resolve(__dirname, 'src/core'),
            },
          },
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
              external: [/src\/config/],
              output: {
                globals: {},
                inlineDynamicImports: true, // Required for UMD with dynamic imports
              },
            },
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.debug'],
              },
              format: {
                comments: false,
              },
              mangle: {
                safari10: true,
              },
            },
            sourcemap: false,
            target: 'es2020',
          },
          define: {
            __VERSION__: JSON.stringify(process.env.npm_package_version || '0.2.0'),
            'process.env.NODE_ENV': '"production"',
            'process.env': '{}',
            global: 'globalThis',
          },
        });
        
        // Build CSS bundle separately
        await build({
          configFile: false,
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            rollupOptions: {
              input: {
                styles: resolve(__dirname, 'src/styles.ts'),
              },
              output: {
                assetFileNames: 'campaign-cart.css',
              },
            },
            cssCodeSplit: false,
            minify: 'esbuild',
            lib: {
              entry: resolve(__dirname, 'src/styles.ts'),
              formats: ['es'],
              fileName: () => 'styles-temp.js',
            },
          },
        });
        
        // Clean up the temporary JS file
        const fs = await import('fs');
        try {
          fs.unlinkSync(resolve(__dirname, 'dist/styles-temp.js'));
        } catch (e) {
          // Ignore if file doesn't exist
        }
      }
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/enhancers': resolve(__dirname, 'src/enhancers'),
      '@/api': resolve(__dirname, 'src/api'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NextCommerce',
      fileName: (format) => `index.${format}.js`,
      formats: ['es'], // Only ES modules support code splitting
    },
    rollupOptions: {
      external: [
        // Ensure config.ts is never bundled in production
        /src\/config/
      ],
      output: {
        globals: {},
        // Enable code splitting for lazy loading
        inlineDynamicImports: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0] === 'style.css') {
            return 'styles/main.css';
          }
          return '[name].[ext]';
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove all console.* statements
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.warn', 'console.debug'], // Remove specific functions
      },
      format: {
        comments: false, // Remove all comments
      },
      mangle: {
        safari10: true, // Work around Safari 10 bugs
      },
    },
    sourcemap: false, // Disable source maps in production
    target: 'es2020',
    cssCodeSplit: false,
    // Extract CSS to a separate file
    cssMinify: true,
  },
  server: {
    port: 3000,
    hmr: true,
    open: 'http://next-staging-core.webflow.io/playground?debugger=true&debug=true',
    cors: {
      origin: true, // Allow all origins in development
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.2.0'),
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    global: 'globalThis',
  },
});