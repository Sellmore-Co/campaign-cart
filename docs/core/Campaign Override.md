# Campaign ID Override Feature

## Overview

The Campaign ID Override feature allows developers and marketers to dynamically switch between different campaigns by using a URL parameter, without needing to modify the code or deploy different versions of the site.

## How It Works

The feature uses the `campaignId` URL parameter to override the default campaign ID configured in the meta tags. The provided campaign ID is:

1. Stored in the user's session storage (persists during the browser session)
2. Used as the API authorization token for all subsequent API requests
3. Applied across all pages visited during the same browser session

## Usage

### URL Parameter Format

To override the campaign ID, simply add the `campaignId` parameter to any URL in your application:

```
https://yourdomain.com/page?campaignId=YOUR_CAMPAIGN_ID
```

For example:
```
https://yourdomain.com/checkout?campaignId=camp_12345
```

### Persistence

- The campaign ID override persists only for the current browser session
- When the browser is closed, the override is cleared
- The override applies to all pages visited during the session, even if the URL parameter is not included in subsequent page URLs

## Technical Implementation

The implementation involves two main components:

1. **Detection and Storage**: When a page loads, the system checks for the `campaignId` parameter in the URL. If found, it's saved to the browser's session storage.

2. **API Authorization**: During API initialization, the system:
   - Checks session storage for a stored campaign ID
   - Uses this ID as the API authorization token if available
   - Falls back to the campaign ID specified in meta tags if no override is found

### Code Flow

1. `TwentyNineNext.js` checks for URL parameters during initialization
2. If a campaign ID is found, it's stored in session storage
3. `ApiClient.js` uses the campaign ID from session storage as the API key
4. All API requests use this campaign ID for authorization

## Testing Different Campaigns

To test different campaigns:

1. Obtain the campaign ID you want to test
2. Add it to the URL as described above
3. Navigate through the site normally - all API calls will use the specified campaign

## Considerations

- This feature should primarily be used for testing and debugging purposes
- For production environments, consider using dedicated subdomains or paths for different campaigns
- Campaign IDs are sensitive information - avoid sharing URLs with campaign ID parameters publicly

## Security Note

Since the campaign ID is used as the API authorization token, it should be treated as sensitive information. Always use HTTPS to prevent man-in-the-middle attacks that could expose this information. 