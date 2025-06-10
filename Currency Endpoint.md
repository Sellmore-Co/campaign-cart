# Currency Exchange Rates Setup Guide

## Overview

This guide covers setting up currency exchange rate functionality for your Cloudflare Worker. The implementation includes:

- **Hourly scheduled updates** via cron triggers
- **KV-based caching** with 1-hour TTL
- **Three new API endpoints** for currency data
- **Open Exchange Rates integration**

## Prerequisites

1. **Open Exchange Rates Account**
   - Sign up at https://openexchangerates.org/account
   - Choose appropriate plan based on usage:
     - Free: 1,000 requests/month (sufficient for caching approach)
     - Developer: $12/month, 10,000 requests/month (recommended)

2. **Cloudflare Workers Environment**
   - Existing KV namespace (already configured as `COUNTRY_DATA`)
   - Ability to set environment secrets

## Setup Steps

### 1. Set Open Exchange Rates API Key

```bash
# Set your Open Exchange Rates API key as a Worker secret
wrangler secret put OXR_API_KEY
# Enter your API key when prompted
```

### 2. Deploy the Updated Worker

```bash
# Deploy with the new configuration
wrangler deploy
```

### 3. Verify Cron Trigger

The cron trigger `0 * * * *` (every hour) should be automatically configured. Verify in Cloudflare Dashboard:
- Go to Workers & Pages > Your Worker > Settings > Triggers
- Should see "Cron Triggers: 0 * * * *"

## API Endpoints

### 1. Get Exchange Rates

**Endpoint:** `GET /currencies/rates`

**Parameters:**
- `base` (optional): Base currency code (default: USD)
- `symbols` (optional): Comma-separated currency codes to return

**Examples:**
```bash
# Get all rates with USD as base
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/rates"

# Get specific currencies
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/rates?symbols=EUR,GBP,JPY"

# Use different base currency (requires paid OXR plan)
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/rates?base=EUR&symbols=USD,GBP"
```

**Response:**
```json
{
  "base": "USD",
  "rates": {
    "EUR": 0.85,
    "GBP": 0.73,
    "JPY": 110.25
  },
  "timestamp": 1640995200000,
  "disclaimer": "...",
  "license": "..."
}
```

### 2. Convert Currency

**Endpoint:** `GET /currencies/convert`

**Parameters:**
- `amount` (optional): Amount to convert (default: 1)
- `from` (optional): Source currency code (default: USD)
- `to` (required): Target currency code

**Examples:**
```bash
# Convert 100 USD to EUR
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/convert?amount=100&from=USD&to=EUR"

# Convert 1 GBP to USD
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/convert?from=GBP&to=USD"
```

**Response:**
```json
{
  "amount": 100,
  "from": "USD",
  "to": "EUR",
  "rate": 0.85,
  "result": 85.00,
  "timestamp": 1640995200000
}
```

### 3. List Supported Currencies

**Endpoint:** `GET /currencies/list`

**Example:**
```bash
curl "https://cdn-countries.muddy-wind-c7ca.workers.dev/currencies/list"
```

**Response:**
```json
[
  {
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$"
  },
  {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€"
  }
]
```

## Caching Strategy

### KV Storage Keys
- `rates:USD:all` - All rates with USD base
- `rates:USD:EUR,GBP,JPY` - Specific currencies with USD base
- `rates:EUR:USD,GBP` - Rates with EUR base (requires paid plan)

### Cache TTL
- **KV Storage:** 2 hours (backup)
- **Edge Cache:** 1 hour
- **Browser Cache:** 1 hour

### Update Schedule
- **Cron Job:** Every hour (`0 * * * *`)
- **Fallback:** On-demand fetch if cache miss

## Monitoring

### Check Cron Execution
```bash
# View worker logs to verify cron execution
wrangler tail --format=pretty
```

### Verify Cache Status
Response headers indicate cache status:
- `X-Cache: HIT` - Served from edge cache
- `X-Cache: MISS` - Fresh data fetched

### Monitor Usage
- Open Exchange Rates dashboard shows API usage
- Cloudflare Analytics shows worker invocations

## Cost Optimization

### Expected Usage (10k requests/month)
With 90% cache hit rate:
- **Worker Requests:** 10,000/month (within free tier)
- **OXR API Calls:** ~1,000/month (cron updates + cache misses)
- **KV Operations:** ~500 writes + 10,000 reads/month
- **Total Cost:** ~$12/month (OXR Developer plan)

### Free Tier Usage
With 1,000 OXR requests/month:
- Hourly updates: 744 requests/month
- Remaining: 256 for cache misses
- Requires 97%+ cache hit rate

## SDK Integration Example

```javascript
// Example SDK usage
const currencySDK = {
  baseUrl: 'https://cdn-countries.muddy-wind-c7ca.workers.dev',
  
  async getRates(base = 'USD', symbols = null) {
    const params = new URLSearchParams();
    if (base !== 'USD') params.append('base', base);
    if (symbols) params.append('symbols', symbols.join(','));
    
    const response = await fetch(`${this.baseUrl}/currencies/rates?${params}`);
    return await response.json();
  },
  
  async convert(amount, from, to) {
    const params = new URLSearchParams({
      amount: amount.toString(),
      from,
      to
    });
    
    const response = await fetch(`${this.baseUrl}/currencies/convert?${params}`);
    return await response.json();
  },
  
  async getSupportedCurrencies() {
    const response = await fetch(`${this.baseUrl}/currencies/list`);
    return await response.json();
  }
};

// Usage examples
const rates = await currencySDK.getRates('USD', ['EUR', 'GBP']);
const conversion = await currencySDK.convert(100, 'USD', 'EUR');
const currencies = await currencySDK.getSupportedCurrencies();
```

## Troubleshooting

### Common Issues

1. **"Currency rates not available"**
   - Check if OXR_API_KEY secret is set
   - Verify cron job has run (check logs)
   - Confirm OXR account has remaining quota

2. **"Invalid API key" errors**
   - Verify OXR_API_KEY secret value
   - Check API key status in OXR dashboard

3. **Base currency errors**
   - Non-USD base currencies require paid OXR plan
   - Free tier only supports USD as base

4. **Rate limit exceeded**
   - Check OXR usage in dashboard
   - Consider upgrading plan or improving cache hit rate

### Debug Commands

```bash
# Check secrets
wrangler secret list

# View recent logs
wrangler tail --format=pretty

# Test cron trigger manually
wrangler dev --test-scheduled

# Check KV contents
wrangler kv:key list --binding=COUNTRY_DATA
```

## Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `OXR_API_KEY` | Secret | Open Exchange Rates API key |
| `COUNTRY_DATA` | KV Binding | Existing KV namespace for caching |

## Deployment Checklist

- [ ] Open Exchange Rates account created
- [ ] API key obtained and set as secret
- [ ] Worker deployed with updated code
- [ ] Cron trigger configured (hourly)
- [ ] Test endpoints responding correctly
- [ ] Monitor initial cron execution
- [ ] Verify cache behavior
- [ ] Update SDK/client code

## Next Steps

1. **Monitor Performance**: Track cache hit rates and API usage
2. **Optimize Caching**: Adjust TTL based on usage patterns
3. **Add Features**: Historical rates, currency trends, alerts
4. **Scale Considerations**: Multiple regions, advanced caching strategies

For support or questions, refer to:
- [Open Exchange Rates Documentation](https://docs.openexchangerates.org/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/) 