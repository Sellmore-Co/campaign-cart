import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building with bundle analyzer...');

await build({
  configFile: false,
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
    })
  ],
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
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NextCommerce',
      fileName: (format) => `index.${format}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [/src\/config/],
      output: {
        globals: {},
        inlineDynamicImports: false,
      },
    },
    outDir: 'dist',
  },
});

console.log('Bundle analysis complete! Check dist/stats.html');