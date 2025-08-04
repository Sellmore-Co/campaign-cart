# Upsell Configuration

Configure upsell flows and behavior with meta tags and attributes.

## Basic Configuration

Set URLs for upsell flow navigation:

```html
<!-- Where to go after accepting any upsell -->
<meta name="next-upsell-accept-url" content="/demo/receipt">

<!-- Where to go after declining all upsells -->
<meta name="next-upsell-decline-url" content="/demo/receipt">
```

## Page Configuration

Mark pages as upsell pages:

```html
<!-- Identify page as upsell -->
<meta name="next-page-type" content="upsell">

<!-- Prevent back navigation on first upsell -->
<meta name="next-prevent-back-navigation" content="true">
```

## Order Context

Upsells need order context (from URL parameter):

```html
<!-- Order ID passed as URL parameter -->
<!-- Example: /upsell?ref_id=ORDER123 -->
```

## Multiple Upsell Pages

Chain multiple upsell pages:

```html
<!-- Page 1: /upsell-1 -->
<meta name="next-upsell-accept-url" content="/upsell-2">
<meta name="next-upsell-decline-url" content="/upsell-2">

<!-- Page 2: /upsell-2 -->
<meta name="next-upsell-accept-url" content="/receipt">
<meta name="next-upsell-decline-url" content="/receipt">
```

## Conditional Routing

TODO: Add information about:
- Conditional upsell routing based on cart contents
- A/B testing different upsell flows
- Dynamic upsell selection

## Upsell Analytics

Track upsell performance:

```javascript
// Listen to upsell events
next.on('upsell:shown', (data) => {
  // Track impression
});

next.on('upsell:accepted', (data) => {
  // Track conversion
});

next.on('upsell:declined', (data) => {
  // Track decline
});
```

## Best Practices

1. **Limit Steps**: Keep upsell flow to 2-3 steps max
2. **Fast Loading**: Optimize page load for upsells
3. **Mobile Friendly**: Ensure upsells work on mobile
4. **Clear Progress**: Show where user is in flow
5. **Easy Exit**: Always provide clear decline option

## Advanced Configuration

TODO: Add information about:
- Custom upsell logic
- Server-side upsell selection
- Personalized upsell offers
- Time-limited upsell windows