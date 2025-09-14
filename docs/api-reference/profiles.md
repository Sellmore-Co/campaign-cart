# Profile API Reference

The Profile System provides methods for managing dynamic package mappings through the `window.next` API.

## Methods

### setProfile(profileId, options?)

Applies a profile to the current session, swapping all package IDs according to the profile's mappings.

**Parameters:**
- `profileId` (string, required): The ID of the profile to apply
- `options` (object, optional):
  - `clearCart` (boolean): Clear cart before applying profile (default: false)
  - `preserveQuantities` (boolean): Maintain item quantities (default: true)

**Returns:** Promise<void>

**Example:**
```javascript
// Basic usage
await window.next.setProfile('black_friday');

// With options
await window.next.setProfile('vip', {
  clearCart: true,
  preserveQuantities: false
});
```

### revertProfile()

Reverts to the original cart state before any profile was applied.

**Returns:** Promise<void>

**Example:**
```javascript
await window.next.revertProfile();
```

### getActiveProfile()

Returns the ID of the currently active profile.

**Returns:** string | null

**Example:**
```javascript
const currentProfile = window.next.getActiveProfile();
console.log(currentProfile); // "black_friday" or null
```

### getProfileInfo(profileId?)

Gets detailed information about a profile.

**Parameters:**
- `profileId` (string, optional): Profile ID to query. If omitted, returns active profile info.

**Returns:** Profile object or null

**Example:**
```javascript
const profile = window.next.getProfileInfo('black_friday');
console.log(profile);
// {
//   id: "black_friday",
//   name: "Black Friday Sale",
//   packageMappings: { 1: 101, 2: 102, ... }
// }
```

### getMappedPackageId(originalId)

Gets the mapped package ID for the active profile.

**Parameters:**
- `originalId` (number): The original package ID

**Returns:** number (mapped ID or original if no mapping)

**Example:**
```javascript
const mappedId = window.next.getMappedPackageId(1);
console.log(mappedId); // 101 (if black_friday profile is active)
```

### getOriginalPackageId(mappedId)

Gets the original package ID from a mapped ID.

**Parameters:**
- `mappedId` (number): The mapped package ID

**Returns:** number | null

**Example:**
```javascript
const originalId = window.next.getOriginalPackageId(101);
console.log(originalId); // 1
```

### listProfiles()

Returns an array of all configured profile IDs.

**Returns:** string[]

**Example:**
```javascript
const profiles = window.next.listProfiles();
console.log(profiles); // ["regular", "black_friday", "vip"]
```

### hasProfile(profileId)

Checks if a profile exists in the configuration.

**Parameters:**
- `profileId` (string): Profile ID to check

**Returns:** boolean

**Example:**
```javascript
if (window.next.hasProfile('black_friday')) {
  // Profile exists
}
```

### registerProfile(profile)

Registers a new profile dynamically at runtime.

**Parameters:**
- `profile` (object):
  - `id` (string): Unique profile identifier
  - `name` (string): Display name
  - `description` (string, optional): Profile description
  - `packageMappings` (object): Package ID mappings

**Returns:** void

**Example:**
```javascript
window.next.registerProfile({
  id: 'flash_sale',
  name: 'Flash Sale',
  description: '2-hour flash sale',
  packageMappings: {
    1: 401,
    2: 402,
    3: 403
  }
});
```

## Events

### profile:applied

Fired when a profile is successfully applied.

**Event Data:**
- `profileId` (string): Applied profile ID
- `previousProfileId` (string | null): Previous profile ID
- `itemsSwapped` (number): Number of cart items affected
- `originalItems` (number): Original cart item count
- `cleared` (boolean): Whether cart was cleared
- `profile` (object): Full profile object

**Example:**
```javascript
window.next.on('profile:applied', (data) => {
  console.log(`Profile ${data.profileId} applied`);
  console.log(`Swapped ${data.itemsSwapped} items`);
});
```

### profile:reverted

Fired when a profile is reverted.

**Event Data:**
- `previousProfileId` (string | null): The profile that was active
- `itemsRestored` (number): Number of items restored

**Example:**
```javascript
window.next.on('profile:reverted', (data) => {
  console.log(`Restored ${data.itemsRestored} original items`);
});
```

### profile:switched

Fired when switching between profiles.

**Event Data:**
- `fromProfileId` (string | null): Previous profile
- `toProfileId` (string): New profile
- `itemsAffected` (number): Number of items affected

### profile:registered

Fired when a new profile is registered.

**Event Data:**
- `profileId` (string): Registered profile ID
- `mappingsCount` (number): Number of package mappings

## Data Attributes

### data-next-profile

Activates a profile when clicked.

**Attributes:**
- `data-next-profile` (required): Profile ID to activate
- `data-next-clear-cart` (optional): Clear cart before applying ("true"/"false")
- `data-next-preserve-quantities` (optional): Preserve item quantities ("true"/"false")
- `data-next-active-text` (optional): Text to show when profile is active
- `data-next-inactive-text` (optional): Text to show when profile is inactive

**Example:**
```html
<button data-next-profile="black_friday" 
        data-next-clear-cart="false"
        data-next-active-text="Black Friday Active ✓"
        data-next-inactive-text="Activate Black Friday">
  Activate Black Friday
</button>
```

### data-next-profile-selector

Creates a dropdown selector for profiles.

**Attributes:**
- `data-next-profile-selector` (required): Marks element as profile selector
- `data-next-auto-populate` (optional): Auto-populate with configured profiles ("true")
- `data-next-clear-cart` (optional): Clear cart on profile change ("true"/"false")
- `data-next-preserve-quantities` (optional): Preserve quantities ("true"/"false")

**Example:**
```html
<select data-next-profile-selector 
        data-next-auto-populate="true">
</select>
```

### data-next-show-if-profile

Shows element only when specific profile is active.

**Attributes:**
- `data-next-show-if-profile` (required): Profile ID to check

**Example:**
```html
<div data-next-show-if-profile="black_friday">
  Black Friday prices are active!
</div>
```

## URL Parameters

### ?profile=

Applies a profile on page load (preserves existing cart).

**Example:**
```
https://example.com/checkout?profile=black_friday
```

### ?forceProfile=

Applies a profile on page load (clears cart first).

**Example:**
```
https://example.com/checkout?forceProfile=vip
```

### ?packageProfile=

Alternative parameter name for profile activation.

**Example:**
```
https://example.com/checkout?packageProfile=sale_20
```

## Configuration

Profiles are configured in `window.nextConfig`:

```javascript
window.nextConfig = {
  profiles: {
    "profile_id": {
      name: "Profile Name",
      description: "Optional description",
      packageMappings: {
        1: 101,  // original_id: mapped_id
        2: 102,
        // ... more mappings
      }
    }
  },
  defaultProfile: "profile_id" // Optional default
};
```

## CSS Classes

The following CSS classes are automatically applied:

- `.next-profile-switcher` - Applied to profile switcher elements
- `.next-profile-active` - Applied when profile is active
- `.next-profile-selector` - Applied to profile selector dropdowns
- `.next-loading` - Applied during profile switching

## TypeScript Types

```typescript
interface Profile {
  id: string;
  name: string;
  description?: string;
  packageMappings: Record<number, number>;
  reverseMapping?: Record<number, number>;
  isActive?: boolean;
  priority?: number;
}

interface ProfileState {
  profiles: Map<string, Profile>;
  activeProfileId: string | null;
  previousProfileId: string | null;
  mappingHistory: MappingEvent[];
  originalCartSnapshot?: CartItem[];
}

interface MappingEvent {
  timestamp: number;
  profileId: string;
  action: 'applied' | 'reverted' | 'switched';
  itemsAffected: number;
  previousProfileId?: string;
}
```