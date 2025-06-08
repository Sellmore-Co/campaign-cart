---
title: Page Types & Meta Tags
description: Quick reference for essential meta tags required on different types of pages in your funnel
---

This guide provides a quick reference for the essential `meta` tags required on different types of pages in your funnel. Using the correct `os-page-type` is crucial for the SDK to initialize the correct features for each step.

## Global (All Pages)

These tags should be included in the `<head>` of **every page** where Campaign Cart is active.

```html
<!-- Required: Your campaign API key -->
<meta name="os-api-key" content="YOUR_API_KEY_HERE">

<!-- Recommended: Spreedly payment environment key, required for payments -->
<meta name="os-payment-env-key" content="YOUR_SPREEDLY_KEY_HERE">

<!-- Optional: Enable debug mode for development -->
<meta name="os-debug" content="true">
```

-   `os-api-key`: **Required.** Your main campaign API key from 29next.
-   `os-payment-env-key`: **Required for payments.** Your Spreedly environment key.
-   `os-debug`: Enables verbose logging in the browser console. Set to `false` or remove for production.

---

## Product or Catalog Page

These pages display products but do not handle checkout processing.

```html
<!-- All Global Meta Tags... -->

<!-- Defines the page purpose for analytics -->
<meta name="os-page-type" content="product">

<!-- A custom name for tracking this specific page variation -->
<meta name="os-page-name" content="Main_Product_Catalog">
```

-   `os-page-type="product"`: Tells the SDK that this is a standard page for displaying products.
-   `os-page-name`: A custom identifier used for analytics to track the performance of this specific page.

---

## Checkout Page

This is the main page where customers enter their shipping and payment information.

```html
<!-- All Global Meta Tags... -->

<!-- Required: Defines the page as a checkout page -->
<meta name="os-page-type" content="checkout">

<!-- Required: The URL for the next step after a successful checkout -->
<meta name="os-next-page" content="/upsell-1">

<!-- Optional: A custom name for tracking this page -->
<meta name="os-page-name" content="Main_Checkout_v1">
```

-   `os-page-type="checkout"`: **Required.** Initializes the checkout form and all payment processing logic.
-   `os-next-page`: **Required.** The URL where the user will be redirected after their initial payment is successfully processed. This is typically an upsell or receipt page.

---

## Upsell or Downsell Page

These pages are shown *after* the main checkout is complete to offer additional products with a single click.

```html
<!-- All Global Meta Tags... -->

<!-- Required: Defines the page as an upsell page -->
<meta name="os-page-type" content="upsell">

<!-- Required: The URL for the next step (another upsell or the final receipt) -->
<meta name="os-next-page" content="/receipt">

<!-- Optional: A custom name for tracking this page -->
<meta name="os-page-name" content="Upsell_1_Bonus_Offer">
```

-   `os-page-type="upsell"`: **Required.** Enables the one-click "accept" and "decline" functionality for post-purchase offers.
-   `os-next-page`: **Required.** The URL where the user will go after clicking either the accept or decline button.

---

## Receipt / Confirmation Page

This is the final page in the funnel, confirming the completed order and all its contents.

```html
<!-- All Global Meta Tags... -->

<!-- Required: Defines the page as a receipt page -->
<meta name="os-page-type" content="receipt">

<!-- Optional: A custom name for tracking this page -->
<meta name="os-page-name" content="Order_Confirmation_A">
```

-   `os-page-type="receipt"`: **Required.** Enables the SDK to fetch the complete order details (using the `ref_id` from the URL) and automatically populate your receipt template. 