# Checkout Form Event Handler Refactoring

## Issue Summary
The checkout form currently has duplicate event listeners on the country field, causing duplicate API calls when users change their country selection. This happens because:

1. **General field handler** - All form fields get a change event listener via `setupEventListeners()` 
2. **Autocomplete-specific handler** - Country fields get an additional change listener via `setupAutocompleteCountryChangeListeners()`

## Current Workaround
We've implemented deduplication in `handleCountryCurrencyChange()` that prevents duplicate currency switches and campaign fetches within a 500ms window. This works but is a defensive patch rather than addressing the root cause.

## Files Affected
- `src/enhancers/checkout/CheckoutFormEnhancer.ts`

## Proposed Solution
Refactor the event handling system to use a single, centralized event delegation pattern:

### 1. Create a Unified Event Handler
```typescript
private handleFieldEvent(event: Event, fieldName: string, fieldType: 'shipping' | 'billing') {
  // Route to appropriate handler based on field
  switch(fieldName) {
    case 'country':
      await this.handleCountryChange(event, fieldType);
      break;
    case 'province':
      await this.handleProvinceChange(event, fieldType);
      break;
    // ... other fields
  }
}
```

### 2. Single Country Change Handler
```typescript
private async handleCountryChange(event: Event, fieldType: 'shipping' | 'billing') {
  const target = event.target as HTMLSelectElement;
  const countryCode = target.value;
  
  // Update states
  await this.updateStateOptions(countryCode, fieldType);
  
  // Update autocomplete restrictions if loaded
  if (this.autocompleteInstances.size > 0) {
    this.updateAutocompleteRestrictions(countryCode, fieldType);
  }
  
  // Handle currency change (only for shipping)
  if (fieldType === 'shipping') {
    await this.handleCountryCurrencyChange(countryCode, target);
  }
}
```

### 3. Remove Duplicate Listeners
- Remove the separate autocomplete country change listeners
- Keep autocomplete setup focused only on initializing the autocomplete instances
- Let the main field handler deal with country changes

## Benefits
1. **Single source of truth** for field change handling
2. **Easier to debug** - all events flow through one place
3. **No duplicate API calls** without needing deduplication workarounds
4. **Better separation of concerns** - autocomplete just handles address suggestions

## Implementation Notes
- Keep the current deduplication as a safety net during refactoring
- Test thoroughly with both manual country selection and autocomplete
- Ensure the fix works with:
  - Direct country dropdown changes
  - Google Maps autocomplete address selection
  - Debug country selector changes
  - Both shipping and billing address forms

## Testing Checklist
- [ ] Country change triggers only one state API call
- [ ] Country change triggers only one campaign API call (when currency changes)
- [ ] Autocomplete restrictions update correctly when country changes
- [ ] Billing country changes don't affect currency
- [ ] Debug country selector still works correctly
- [ ] Form validation still works
- [ ] Phone number country codes update correctly

## Related Issues
- Duplicate state loading API calls (fixed with promise sharing)
- Duplicate campaign loading when currency changes (fixed with deduplication)
- Billing country incorrectly triggering currency changes (fixed by removing currency logic from billing)