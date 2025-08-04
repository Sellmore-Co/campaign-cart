# Performance Optimization

Tips and techniques for optimizing Next Commerce JS SDK performance.

## Initial Load Optimization

### Async Loading
```html
<!-- Good: Load SDK asynchronously -->
<script async src="https://campaign-cart-v2.pages.dev/loader.js"></script>

<!-- Better: Preconnect to SDK domain -->
<link rel="preconnect" href="https://campaign-cart-v2.pages.dev">
<script async src="https://campaign-cart-v2.pages.dev/loader.js"></script>
```

### Critical CSS
```html
<!-- Inline critical styles to prevent FOUC -->
<style>
  /* Loading state styles */
  [data-next-await] {
    min-height: 20px;
    background: #f0f0f0;
    border-radius: 4px;
  }
  
  /* Hide dynamic content until ready */
  html:not(.next-display-ready) [data-next-display] {
    visibility: hidden;
  }
</style>
```

### Resource Hints
```html
<head>
  <!-- DNS prefetch for API calls -->
  <link rel="dns-prefetch" href="//api.nextcampaign.com">
  
  <!-- Preconnect for faster API requests -->
  <link rel="preconnect" href="https://api.nextcampaign.com">
  
  <!-- Prefetch common assets -->
  <link rel="prefetch" href="/images/loading.svg">
</head>
```

## Render Performance

### Minimize Layout Thrashing
```javascript
// Bad: Causes multiple reflows
elements.forEach(el => {
  el.style.height = el.offsetHeight + 10 + 'px'; // Read
  el.style.width = el.offsetWidth + 10 + 'px';   // Read
});

// Good: Batch reads and writes
const measurements = elements.map(el => ({
  height: el.offsetHeight,
  width: el.offsetWidth
}));

elements.forEach((el, i) => {
  el.style.height = measurements[i].height + 10 + 'px';
  el.style.width = measurements[i].width + 10 + 'px';
});
```

### Use CSS Transforms
```css
/* Bad: Triggers layout */
.product-card:hover {
  left: 10px;
  top: -5px;
}

/* Good: Uses GPU acceleration */
.product-card:hover {
  transform: translate(10px, -5px);
}
```

### Optimize Animations
```css
/* Enable GPU acceleration */
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}

/* Clean up after animation */
.animated-element.animation-done {
  will-change: auto;
}
```

## Image Optimization

### Lazy Loading
```html
<!-- Native lazy loading -->
<img data-next-display="package.image" 
     loading="lazy"
     width="300"
     height="300"
     alt="Product">

<!-- With placeholder -->
<div class="image-container">
  <img src="placeholder.svg"
       data-src="actual-image.jpg"
       loading="lazy"
       class="lazy-image"
       alt="Product">
</div>
```

### Responsive Images
```html
<picture>
  <source media="(max-width: 768px)" 
          srcset="product-mobile.webp">
  <source media="(min-width: 769px)" 
          srcset="product-desktop.webp">
  <img src="product-fallback.jpg" 
       alt="Product"
       loading="lazy">
</picture>
```

## Large Data Sets

### Virtual Scrolling
```html
<div class="virtual-scroll-container" 
     style="height: 600px; overflow-y: auto;">
  <div class="spacer" style="height: 10000px;">
    <!-- Only render visible items -->
    <div class="visible-items" style="transform: translateY(200px);">
      <!-- 10 visible items out of 500 total -->
    </div>
  </div>
</div>
```

### Pagination
```html
<!-- Paginated product list -->
<div class="product-grid" data-page="1" data-per-page="20">
  <!-- Only load 20 items at a time -->
</div>

<button onclick="loadMore()">Load More Products</button>

<script>
function loadMore() {
  const grid = document.querySelector('.product-grid');
  const nextPage = parseInt(grid.dataset.page) + 1;
  // Load next page of products
}
</script>
```

## Event Optimization

### Debouncing
```javascript
// Debounce search input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const searchProducts = debounce((query) => {
  // Perform search
}, 300);

document.querySelector('#search').addEventListener('input', (e) => {
  searchProducts(e.target.value);
});
```

### Throttling
```javascript
// Throttle scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const handleScroll = throttle(() => {
  // Update UI based on scroll
}, 100);

window.addEventListener('scroll', handleScroll);
```

### Event Delegation
```javascript
// Bad: Many listeners
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', handleClick);
});

// Good: Single listener
document.querySelector('.product-grid').addEventListener('click', (e) => {
  const card = e.target.closest('.product-card');
  if (card) {
    handleClick(card);
  }
});
```

## Memory Management

### Clean Up References
```javascript
// Remove event listeners
const controller = new AbortController();

next.on('cart:updated', handleUpdate, { signal: controller.signal });

// Later, clean up
controller.abort();

// Clear intervals/timeouts
const timers = new Set();

function createTimer(callback, delay) {
  const id = setTimeout(() => {
    callback();
    timers.delete(id);
  }, delay);
  timers.add(id);
  return id;
}

// Clean up all timers
function cleanup() {
  timers.forEach(id => clearTimeout(id));
  timers.clear();
}
```

### Avoid Memory Leaks
```javascript
// Bad: Closure keeps reference
function setupProduct(element) {
  const hugeData = generateHugeDataSet();
  
  element.addEventListener('click', () => {
    // hugeData is kept in memory even if not used
    console.log('clicked');
  });
}

// Good: Clean references
function setupProduct(element) {
  let hugeData = generateHugeDataSet();
  
  // Process data
  processData(hugeData);
  
  // Clear reference
  hugeData = null;
  
  element.addEventListener('click', () => {
    console.log('clicked');
  });
}
```

## Network Optimization

### Batch API Calls
```javascript
// Bad: Multiple API calls
async function loadProductDetails(ids) {
  const products = [];
  for (const id of ids) {
    const product = await fetchProduct(id);
    products.push(product);
  }
  return products;
}

// Good: Single batched call
async function loadProductDetails(ids) {
  return await fetchProducts({ ids: ids });
}
```

### Cache Responses
```javascript
// Simple cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}
```

## Bundle Size

### Tree Shaking
```javascript
// Bad: Import entire library
import * as utils from './utils';

// Good: Import only what you need
import { formatPrice, calculateTax } from './utils';
```

### Code Splitting
```javascript
// Lazy load heavy features
button.addEventListener('click', async () => {
  const { openAdvancedBuilder } = await import('./advanced-builder.js');
  openAdvancedBuilder();
});
```

## Monitoring Performance

### Performance Observer
```javascript
// Monitor long tasks
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn('Long task detected:', entry.duration);
  }
});

observer.observe({ entryTypes: ['longtask'] });

// Measure specific operations
performance.mark('cart-update-start');
// ... operation ...
performance.mark('cart-update-end');
performance.measure('cart-update', 'cart-update-start', 'cart-update-end');
```

### Core Web Vitals
```javascript
// Monitor CLS (Cumulative Layout Shift)
let clsValue = 0;
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  }
});
observer.observe({ type: 'layout-shift', buffered: true });
```

## Best Practices Summary

1. **Load SDK asynchronously** - Don't block page render
2. **Use loading states** - Prevent layout shift
3. **Lazy load images** - Improve initial load
4. **Debounce events** - Reduce processing overhead
5. **Batch operations** - Minimize API calls
6. **Clean up resources** - Prevent memory leaks
7. **Monitor performance** - Track real user metrics

## Performance Checklist

- [ ] SDK loads asynchronously
- [ ] Critical CSS is inlined
- [ ] Images are optimized and lazy loaded
- [ ] Events are debounced/throttled appropriately
- [ ] Large lists use virtual scrolling or pagination
- [ ] Animations use CSS transforms
- [ ] Memory is properly managed
- [ ] API calls are batched when possible
- [ ] Performance metrics are monitored