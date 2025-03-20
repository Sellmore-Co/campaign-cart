# Post-Purchase Upsell Functionality

This document describes how to implement post-purchase upsells in your 29next campaign funnel.

## Overview

The upsell functionality allows you to offer additional products to customers after they've completed their initial purchase. This can significantly increase your average order value (AOV) and provide customers with complementary products.

## Key Features

- Add upsells to completed orders
- Multi-step upsell funnel support
- Easy integration with data attributes
- Automatic order reference ID handling
- Customizable upsell pages
- Prevents multiple button clicks during processing

## Implementation

### 1. Set Up Meta Tags

First, configure your page with the necessary meta tags:

```html
<!-- Required: API Key -->
<meta name="os-api-key" content="YOUR_API_KEY">

<!-- Identify this as an upsell page -->
<meta name="os-page-type" content="upsell">

<!-- Set the next page for redirects (receipt page or next upsell) -->
<meta name="os-next-page" content="/receipt">
```

### 2. Create Upsell Buttons

Add buttons or links with the following data attributes:

#### Accept Button (Add to Order)

```html
<a href="#" 
   data-os-upsell="accept" 
   data-os-package-id="123" 
   data-os-quantity="1" 
   data-os-next-url="/receipt">
  YES! Add This To My Order
</a>
```

- `data-os-upsell="accept"` - Identifies this as an accept button
- `data-os-package-id="123"` - The package ID to add (required)
- `data-os-quantity="1"` - The quantity to add (optional, defaults to 1)
- `data-os-next-url="/receipt"` - Where to redirect after processing (optional, uses meta tag if not specified)

#### Decline Button (Skip Upsell)

```html
<a href="#" 
   data-os-upsell="decline" 
   data-os-next-url="/receipt">
  No thanks, I'll pass
</a>
```

- `data-os-upsell="decline"` - Identifies this as a decline button
- `data-os-next-url="/receipt"` - Where to redirect after declining (optional, uses meta tag if not specified)

### 3. Error Handling

Add an error container to display any error messages:

```html
<div data-os-error-container></div>
```

Style this container to be hidden by default and display when errors occur.

## Building a Multi-Step Upsell Funnel

To create a multi-step upsell funnel:

1. Create multiple HTML pages for each upsell offer
2. On each page except the last, set the `data-os-next-url` or `meta name="os-next-page"` to point to the next upsell page
3. On the final upsell page, set the next URL to your receipt/thank you page

For example:

- Checkout → Upsell 1 (`/up1`) → Upsell 2 (`/up2`) → Receipt (`/receipt`)

## Order Reference ID Handling

The UpsellManager automatically handles the order reference ID:

1. It first looks for `ref_id` in the URL parameters
2. If not found, it checks `sessionStorage` for a stored reference ID
3. If found in the URL, it stores the ID in `sessionStorage` for subsequent pages

This allows seamless navigation between upsell pages without losing the order context.

## Advanced Configuration

### Custom Styling

Add a loading state to your page to indicate when an upsell is being processed:

```css
.os-loading {
  opacity: 0.7;
  pointer-events: none;
}
.os-loading .btn-primary::after {
  content: "...";
  display: inline-block;
  animation: ellipsis 1.5s infinite;
}
@keyframes ellipsis {
  0% { content: "."; }
  33% { content: ".."; }
  66% { content: "..."; }
}

/* Styles for disabled buttons */
.os-button-disabled {
  opacity: 0.7 !important;
  cursor: not-allowed !important;
}
```

When a user clicks an upsell accept or decline button, all buttons are automatically disabled to prevent multiple clicks. In case of an error during acceptance, the buttons will be re-enabled so the user can try again.

## API Reference

### UpsellManager

The UpsellManager handles the upsell functionality and is automatically initialized on upsell pages.

#### Methods

- `acceptUpsell(packageId, quantity, nextUrl)` - Adds an upsell to the order
- `declineUpsell(nextUrl)` - Declines the upsell and redirects

### ApiClient

The ApiClient has been extended with a method to handle upsell API requests:

- `createOrderUpsell(orderRef, upsellData)` - Adds an upsell to an existing order

## Example Templates

See the `examples` directory for example upsell page templates:

- `upsell-page.html` - Basic upsell page
- `upsell-page-2.html` - Second step upsell page with different styling 