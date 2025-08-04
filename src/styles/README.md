# Campaign Cart CSS Usage

## Build Output

When you run `npm run build`, the CSS is handled in two ways:

### 1. Bundled CSS (Default)
If you import the styles entry point:
```javascript
import '@29next/campaign-cart/styles';
```
The CSS will be automatically injected when loaded.

### 2. Separate CSS Files
The build also copies all CSS files to `dist/styles/` maintaining the directory structure:
- `dist/styles/main.css` - Base styles
- `dist/styles/components/cart.css` - Cart component styles  
- `dist/styles/components/checkout.css` - Checkout form styles

## Usage Options

### Option 1: Import Everything (JS + CSS)
```javascript
import '@29next/campaign-cart';
import '@29next/campaign-cart/styles'; // Optional, for CSS
```

### Option 2: Link CSS Files Directly
```html
<!-- In your HTML -->
<link rel="stylesheet" href="/path/to/dist/styles/main.css">
<link rel="stylesheet" href="/path/to/dist/styles/components/cart.css">
<link rel="stylesheet" href="/path/to/dist/styles/components/checkout.css">
```

### Option 3: Import Specific CSS in Your Bundler
```javascript
// In your app
import '@29next/campaign-cart/dist/styles/main.css';
import '@29next/campaign-cart/dist/styles/components/cart.css';
```

## CSS Architecture

- **main.css**: Base styles, utilities, animations
- **components/cart.css**: Cart-specific component styles
- **components/checkout.css**: Checkout form styles
- **debug/*.css**: Debug overlay styles (loaded dynamically)

## Customization

All styles use:
- CSS custom properties for theming
- `data-next-*` attribute selectors
- `.next-*` prefixed classes to avoid conflicts

You can override any styles by:
1. Using more specific selectors
2. Overriding CSS custom properties
3. Loading your styles after ours