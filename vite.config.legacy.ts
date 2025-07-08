import { defineConfig } from 'vite';
import { resolve } from 'path';

// Legacy build for older browsers - single bundle UMD
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NextCommerce',
      fileName: () => 'index.umd.js',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Force single bundle for UMD
      }
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});