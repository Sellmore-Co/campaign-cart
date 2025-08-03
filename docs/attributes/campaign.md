# Campaign Attributes

Display campaign-level information like name, currency, and language.

## Available Attributes

```html
<span data-next-display="campaign.name">{Campaign Name}</span>
<span data-next-display="campaign.currency">{Campaign Currency}</span>
<span data-next-display="campaign.language">{Campaign Language}</span>
```

## Examples

### Basic Campaign Info

```html
<div class="campaign-info">
  <h1 data-next-display="campaign.name">Campaign Name</h1>
  <p>Currency: <span data-next-display="campaign.currency">USD</span></p>
  <p>Language: <span data-next-display="campaign.language">en</span></p>
</div>
```

### Currency Display

```html
<!-- Show currency symbol -->
<span data-next-display="campaign.currency">$</span>

<!-- Use in pricing display -->
<div class="price">
  <span data-next-display="campaign.currency">$</span>
  <span data-next-display="package.price">99.99</span>
</div>
```

### Language-Based Content

```html
<!-- Show content based on language -->
<div data-next-show="campaign.language == 'en'">
  Welcome to our store!
</div>
<div data-next-show="campaign.language == 'es'">
  ¡Bienvenido a nuestra tienda!
</div>
```

## Use Cases

1. **Page Headers**: Display campaign name
2. **Currency Formatting**: Show appropriate currency
3. **Localization**: Conditional content by language
4. **Analytics**: Track campaign performance

## Notes

- Campaign data is loaded on SDK initialization
- Values are read-only
- Use for display purposes only

## Additional Campaign Data

TODO: Add information about:
- Campaign ID
- Campaign status
- Campaign dates
- Custom campaign fields