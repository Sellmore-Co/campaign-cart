# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building
- `npm run build` - Production build (minified)
- `npm run build:dev` - Development build (unminified) 
- `npm run build:clean` - Clean production build
- `npm run analyze` - Analyze build output

### Development
- `npm run dev` - Development build with watch mode
- `npm start` or `npm run serve` - Serve built files locally

### Testing
- `npm test` - Run Jest tests

## Architecture Overview

This is a JavaScript utility that connects 29next campaigns with Webflow funnels using HTML attributes. The codebase follows a **Manager Pattern** architecture:

### Core Structure
- **Entry Point**: `src/index.js` - Handles auto-initialization
- **Main Class**: `src/core/TwentyNineNext.js` - Core application class
- **Managers**: Located in `src/managers/` - Each manager handles a specific domain:
  - CartManager - Shopping cart operations
  - CheckoutManager - Checkout flow
  - AttributionManager - Attribution tracking
  - EventManager - Event handling system
  - ProductProfileManager - Product profile management
  - And 13 other specialized managers

### Key Patterns
- **Event-Driven Architecture**: Comprehensive event system for loose coupling between components
- **Service Layer**: `src/services/CurrencyService.js` handles currency operations
- **API Communication**: Centralized through `src/api/ApiClient.js`
- **Component-Based Checkout**: Modular checkout components in `src/components/checkout/`

### Build System
- Uses **esbuild** for fast builds (configured in `build.js`)
- Generates both minified (`29next.min.js`) and unminified (`29next.js`) versions
- CSS is bundled and also available as separate files
- Source maps generated for debugging

### Configuration
The system supports multiple configuration methods:
- Meta tags for API keys and settings
- `window.osConfig` for JavaScript-based configuration
- HTML attributes for component-specific settings

## Important Notes

- Currently on branch `worker-muiti-currency` - implementing multi-currency support
- The project uses JavaScript (not TypeScript despite tsconfig.json presence)
- Comprehensive documentation available in `/docs/` directory
- Event system documentation in `docs/Events.md`
- Checkout configuration details in `docs/checkout/README.md`