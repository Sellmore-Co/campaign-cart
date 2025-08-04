const esbuild = require('esbuild');
const { resolve } = require('path');
const { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } = require('fs');
const { join } = require('path');

const isProd = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');
const distDir = resolve(__dirname, 'dist');

// Ensure output directory exists
!existsSync(distDir) && mkdirSync(distDir);

// Simple CSS minifier
const minifyCss = css => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{}:;,])\s*/g, '$1')
  .replace(/;}/g, '}')
  .replace(/0(px|em|rem)/g, '0')
  .trim();

// CSS plugin to inline CSS as JS (for imports in JS files)
const cssPlugin = {
  name: 'css',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, args => {
      const css = readFileSync(args.path, 'utf8');
      const minified = isProd ? minifyCss(css) : css;
      return {
        contents: `export default \`${minified.replace(/`/g, '\\`')}\``,
        loader: 'js',
      };
    });
  },
};

// Base configuration
const baseConfig = {
  bundle: true,
  sourcemap: !isProd,
  target: 'es2020',
  globalName: 'TwentyNineNext',
  treeShaking: true,
  metafile: true,
  logLevel: 'info',
  charset: 'utf8',
  pure: ['console.log', 'console.info'],
  legalComments: 'none',
  drop: isProd ? ['debugger'] : [],
  plugins: [cssPlugin],
};

// Build configurations
const builds = [
  // Regular non-minified build
  {
    entryPoints: [resolve(__dirname, 'src/index.js')],
    outfile: resolve(distDir, '29next.js'),
    minify: false,
    minifyWhitespace: false,
    minifyIdentifiers: false,
    minifySyntax: false,
    ...baseConfig,
  },
  // Minified build
  {
    entryPoints: [resolve(__dirname, 'src/index.js')],
    outfile: resolve(distDir, '29next.min.js'),
    minify: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    ...baseConfig,
  },
];

// Process CSS files directly
async function processCSS() {
  try {
    const stylesDir = resolve(__dirname, 'src/styles');
    const files = readdirSync(stylesDir).filter(file => file.endsWith('.css'));
    
    // Combine all CSS files
    let combinedCSS = '';
    
    for (const file of files) {
      const filePath = join(stylesDir, file);
      const cssContent = readFileSync(filePath, 'utf8');
      combinedCSS += `/* ${file} */\n${cssContent}\n\n`;
    }
    
    // Write unminified CSS
    writeFileSync(resolve(distDir, 'global.css'), combinedCSS);
    console.log(`📦 global.css: ${(combinedCSS.length / 1024).toFixed(1)}kb`);
    
    // Write minified CSS
    const minifiedCss = minifyCss(combinedCSS);
    writeFileSync(resolve(distDir, 'global.min.css'), minifiedCss);
    console.log(`📦 global.min.css: ${(minifiedCss.length / 1024).toFixed(1)}kb`);
    
    return true;
  } catch (error) {
    console.error('❌ CSS processing failed:', error);
    return false;
  }
}

// Build function
async function build() {
  console.log(`Building in ${isProd ? 'production' : 'development'} mode...`);
  const start = Date.now();

  try {
    const results = await Promise.all(builds.map(config => esbuild.build(config)));
    await processCSS();

    results.forEach((result, index) => {
      const output = Object.values(result.metafile.outputs)[0];
      const sizeKB = (output.bytes / 1024).toFixed(1);
      const fileName = builds[index].outfile.split(/[\\/]/).pop();
      console.log(`📦 ${fileName}: ${sizeKB}kb`);
    });

    console.log(`✅ Done in ${Date.now() - start}ms`);
    if (!isWatch) process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Watch function
async function watch() {
  console.log('👀 Watching for changes...');
  try {
    const contexts = await Promise.all(builds.map(config => esbuild.context(config)));
    await Promise.all(contexts.map(ctx => ctx.watch()));
    
    // Initial CSS processing
    await processCSS();
    
    // Watch CSS files
    const stylesDir = resolve(__dirname, 'src/styles');
    console.log(`Watching CSS files in ${stylesDir}`);
    
    console.log('Serving at http://localhost:3000 (start a server separately, e.g., http-server dist -p 3000)');
    console.log('Press Ctrl+C to stop watching.');

    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}. Stopping watch mode...`);
        await Promise.all(contexts.map(ctx => ctx.dispose()));
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Watch mode failed:', error);
    process.exit(1);
  }
}

// Run build or watch
isWatch ? watch() : build();