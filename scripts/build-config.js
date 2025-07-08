import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the TypeScript config
const configTs = fs.readFileSync(join(__dirname, '../src/config.ts'), 'utf8');

// Extract just the config object
const configMatch = configTs.match(/const config = (\{[\s\S]*?\});/);
if (!configMatch) {
  console.error('Could not find config object in config.ts');
  process.exit(1);
}

// Create the plain JS version
const configJs = `// Auto-generated from src/config.ts
// WARNING: This contains DEMO API keys only!
// For production, use your own configuration
window.nextConfig = ${configMatch[1].replace('debug: true', 'debug: false')};
`;

// Write to dist
fs.mkdirSync(join(__dirname, '../dist'), { recursive: true });
fs.writeFileSync(join(__dirname, '../dist/config.js'), configJs);

console.log('✅ Built config.js from config.ts');