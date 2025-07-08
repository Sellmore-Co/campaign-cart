#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_FILE = path.join(__dirname, '../SDKInitializer-comprehensive-context.md');
const SRC_DIR = path.join(__dirname, '../src');

// Directories to include
const INCLUDE_DIRS = [
  'enhancers/core',
  'enhancers/base',
  'enhancers/display',
  'core',
  'stores',
  'api',
  'utils',
  'types'
];

// Files and patterns to exclude
const EXCLUDE_PATTERNS = [
  /\/checkout\//i,
  /CheckoutFormEnhancer/,
  /CheckoutValidator/,
  /CheckoutStore/,
  /checkoutStore/,
  /checkout-/i,
  /CheckoutOrderManager/,
  /CheckoutFormHandler/,
  /BillingManager/,
  /PaymentService/,
  /\.test\.(ts|tsx)$/,
  /\.spec\.(ts|tsx)$/,
  /\.d\.ts$/
];

// Track all files
const allFiles = [];

// Function to check if a file should be excluded
function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

// Function to get all TypeScript files in specified directories
async function getAllFiles() {
  const files = [];
  
  for (const dir of INCLUDE_DIRS) {
    const pattern = path.join(SRC_DIR, dir, '**/*.{ts,tsx}');
    const dirFiles = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/*.test.ts', '**/*.spec.ts', '**/*.d.ts']
    });
    
    for (const file of dirFiles) {
      if (!shouldExclude(file)) {
        files.push(file);
      }
    }
  }
  
  // Always include SDKInitializer as the primary file
  const sdkInitializerPath = path.join(SRC_DIR, 'enhancers/core/SDKInitializer.ts');
  if (!files.includes(sdkInitializerPath) && fs.existsSync(sdkInitializerPath)) {
    files.unshift(sdkInitializerPath);
  }
  
  return files;
}

// Function to categorize files
function categorizeFiles(files) {
  const categories = {
    'Core Enhancers': [],
    'Base Enhancers': [],
    'Display Enhancers': [],
    'Core SDK': [],
    'Stores': [],
    'API': [],
    'Utilities': [],
    'Types': [],
    'Other': []
  };
  
  files.forEach(file => {
    const relativePath = path.relative(SRC_DIR, file);
    
    if (relativePath.includes('enhancers/core/')) {
      categories['Core Enhancers'].push(file);
    } else if (relativePath.includes('enhancers/base/')) {
      categories['Base Enhancers'].push(file);
    } else if (relativePath.includes('enhancers/display/')) {
      categories['Display Enhancers'].push(file);
    } else if (relativePath.includes('core/')) {
      categories['Core SDK'].push(file);
    } else if (relativePath.includes('stores/')) {
      categories['Stores'].push(file);
    } else if (relativePath.includes('api/')) {
      categories['API'].push(file);
    } else if (relativePath.includes('utils/')) {
      categories['Utilities'].push(file);
    } else if (relativePath.includes('types/')) {
      categories['Types'].push(file);
    } else {
      categories['Other'].push(file);
    }
  });
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
}

// Build the markdown file
function buildMarkdown(categories) {
  let markdown = `# SDKInitializer Comprehensive Context Documentation

This document contains the complete code context for the SDK, including all enhancers, stores, and utilities (excluding checkout-related files).

Generated on: ${new Date().toISOString()}

## Summary

`;

  // Add summary statistics
  let totalFiles = 0;
  Object.entries(categories).forEach(([category, files]) => {
    markdown += `- **${category}**: ${files.length} files\n`;
    totalFiles += files.length;
  });
  
  markdown += `\n**Total Files**: ${totalFiles}\n\n`;
  
  markdown += `## Table of Contents\n\n`;

  // Add table of contents
  let fileIndex = 1;
  Object.entries(categories).forEach(([category, files]) => {
    markdown += `### ${category}\n\n`;
    files.forEach(file => {
      const relativePath = path.relative(path.dirname(__dirname), file);
      markdown += `- [${relativePath}](#file-${fileIndex})\n`;
      fileIndex++;
    });
    markdown += '\n';
  });

  markdown += '---\n\n## File Contents\n\n';

  // Add file contents
  fileIndex = 1;
  Object.entries(categories).forEach(([category, files]) => {
    markdown += `## ${category}\n\n`;
    
    files.forEach(file => {
      const relativePath = path.relative(path.dirname(__dirname), file);
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        markdown += `### File ${fileIndex}: ${relativePath}\n\n`;
        markdown += '```typescript\n';
        markdown += content;
        markdown += '\n```\n\n---\n\n';
        fileIndex++;
      } catch (error) {
        console.error(`Error reading file ${file}:`, error.message);
        markdown += `### File ${fileIndex}: ${relativePath}\n\n`;
        markdown += `Error reading file: ${error.message}\n\n---\n\n`;
        fileIndex++;
      }
    });
  });

  return markdown;
}

// Main execution
async function main() {
  console.log('Building comprehensive SDK documentation...');
  console.log(`Output file: ${OUTPUT_FILE}`);
  console.log('\nIncluding directories:', INCLUDE_DIRS.join(', '));
  console.log('Excluding checkout-related files...\n');

  try {
    // Get all files
    const files = await getAllFiles();
    console.log(`Found ${files.length} TypeScript files\n`);
    
    // Categorize files
    const categories = categorizeFiles(files);
    
    // Log categories
    Object.entries(categories).forEach(([category, catFiles]) => {
      console.log(`${category}: ${catFiles.length} files`);
      if (category === 'Display Enhancers') {
        catFiles.forEach(file => {
          console.log(`  - ${path.basename(file)}`);
        });
      }
    });
    
    // Build and write the markdown
    const markdown = buildMarkdown(categories);
    fs.writeFileSync(OUTPUT_FILE, markdown);
    
    console.log(`\n✅ Successfully generated comprehensive documentation!`);
    console.log(`📄 Output file: ${OUTPUT_FILE}`);
    console.log(`📊 Total files processed: ${files.length}`);
    console.log(`📏 Output size: ${(markdown.length / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();