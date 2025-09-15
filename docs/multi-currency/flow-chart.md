# Multi-Currency System Flow Chart

## System Architecture Flow

```mermaid
graph TB
    Start([Page Load]) --> Init[index.ts: Auto-initialize SDK]
    Init --> SDK[SDKInitializer.initialize]
    
    SDK --> InitLoc[initializeLocationAndCurrency]
    
    InitLoc --> DetectCountry{Detect Country}
    DetectCountry -->|URL Param ?country=XX| URLCountry[Use URL Country]
    DetectCountry -->|Session Storage| SavedCountry[Use Saved Country]
    DetectCountry -->|CDN API| APICountry[Fetch from CDN Workers]
    
    URLCountry --> DetermineCurrency
    SavedCountry --> DetermineCurrency
    APICountry --> DetermineCurrency
    
    DetermineCurrency{Determine Currency}
    DetermineCurrency -->|URL Param ?currency=XXX| URLCurrency[Use URL Currency<br/>Save to Session]
    DetermineCurrency -->|Session Storage| SessionCurrency[Use Saved Currency]
    DetermineCurrency -->|Country Config| CountryCurrency[Use Country's Currency]
    
    URLCurrency --> StoreConfig
    SessionCurrency --> StoreConfig
    CountryCurrency --> StoreConfig
    
    StoreConfig[Store in ConfigStore]
    StoreConfig --> LoadCampaign[Load Campaign with Currency]
    
    LoadCampaign --> CampaignCache{Check Campaign Cache}
    CampaignCache -->|Cache Hit<br/>< 10 min| UseCached[Use Cached Data]
    CampaignCache -->|Cache Miss| FetchCampaign[Fetch from API<br/>with Currency]
    
    UseCached --> InitEnhancers
    FetchCampaign --> CacheData[Cache per Currency<br/>next-campaign-cache_CURRENCY]
    CacheData --> InitEnhancers
    
    InitEnhancers[Initialize Enhancers]
    InitEnhancers --> NextCore[NextCommerce.init]
    NextCore --> EnhancerLoop[Load & Apply Enhancers]
    
    EnhancerLoop --> CheckoutForm[CheckoutFormEnhancer]
    EnhancerLoop --> CartDisplay[CartDisplayEnhancer]
    EnhancerLoop --> OtherEnhancers[Other Enhancers...]
```

## Currency Change Flow (Checkout)

```mermaid
graph TB
    UserAction([User Changes Country<br/>in Checkout]) --> FormChange[CheckoutFormEnhancer<br/>handleFieldChange]
    
    FormChange --> IsShipping{Is Shipping Country?}
    IsShipping -->|Yes| CheckCurrency[handleCountryCurrencyChange]
    IsShipping -->|No - Billing| UpdateStates[Update State Options Only]
    
    CheckCurrency --> Dedupe{Check Deduplication<br/>< 500ms?}
    Dedupe -->|Duplicate| Skip[Skip Processing]
    Dedupe -->|New Request| GetCountryData[Fetch Country Config]
    
    GetCountryData --> CompareCurrency{Different Currency?}
    CompareCurrency -->|No| UpdateStates
    CompareCurrency -->|Yes| SwitchCurrency[Switch Currency]
    
    SwitchCurrency --> SaveSession[Save to Session Storage]
    SaveSession --> ReloadCampaign[Reload Campaign<br/>with New Currency]
    
    ReloadCampaign --> UpdateCart[cartStore.refreshItemPrices]
    UpdateCart --> UpdatePrices[Update All Prices]
    
    UpdatePrices --> PackagePrices[Update Package Prices]
    UpdatePrices --> ShippingPrices[Update Shipping Prices]
    UpdatePrices --> RecalcTotals[Recalculate Totals]
    
    RecalcTotals --> UpdateDisplay[Update Display]
    UpdateDisplay --> FormatCurrency[Format with Currency Symbol]
    
    UpdateStates --> LoadStates{Check State Cache}
    LoadStates -->|Promise Exists| WaitPromise[Await Existing Promise]
    LoadStates -->|No Promise| CreatePromise[Create & Store Promise]
    
    WaitPromise --> PopulateStates
    CreatePromise --> FetchStates[Fetch from CDN API]
    FetchStates --> CacheStates[Cache States Data]
    CacheStates --> PopulateStates[Populate State Dropdown]
```

## Currency Detection Priority

```mermaid
graph LR
    Priority[Currency Priority] --> P1[1. URL Parameter<br/>?currency=XXX]
    P1 --> P2[2. Session Storage<br/>next_selected_currency]
    P2 --> P3[3. Country Config<br/>From CDN API]
    P3 --> P4[4. Fallback<br/>USD]
    
    style P1 fill:#4CAF50,color:#fff
    style P2 fill:#2196F3,color:#fff
    style P3 fill:#FF9800,color:#fff
    style P4 fill:#9E9E9E,color:#fff
```

## Data Flow & Caching

```mermaid
graph TB
    subgraph "Location Data"
        LocAPI[CDN Workers API<br/>location endpoint]
        LocCache[localStorage Cache<br/>1 hour TTL]
        LocAPI -.->|Cache| LocCache
    end
    
    subgraph "Country Config"
        CountryAPI[CDN Workers API<br/>countries/{code}/states]
        StateCache[sessionStorage Cache<br/>per country, 1 hour TTL]
        CountryAPI -.->|Cache| StateCache
    end
    
    subgraph "Campaign Data"
        CampaignAPI[29Next API<br/>campaigns/?currency={code}]
        CampaignCache[sessionStorage Cache<br/>per currency, 10 min TTL]
        CampaignAPI -.->|Cache| CampaignCache
    end
    
    subgraph "Currency State"
        ConfigStore[ConfigStore<br/>Runtime State]
        SessionStore[sessionStorage<br/>next_selected_currency]
        ConfigStore <-.->|Sync| SessionStore
    end
    
    LocCache --> ConfigStore
    StateCache --> ConfigStore
    CampaignCache --> ConfigStore
```

## Component Interactions

```mermaid
sequenceDiagram
    participant User
    participant CheckoutForm
    participant ConfigStore
    participant CampaignStore
    participant CartStore
    participant API
    
    User->>CheckoutForm: Change Country (Shipping)
    CheckoutForm->>CheckoutForm: Check Deduplication
    CheckoutForm->>API: Get Country Config
    API-->>CheckoutForm: Country Data + Currency
    
    alt Different Currency
        CheckoutForm->>ConfigStore: Update Currency
        ConfigStore->>CampaignStore: Trigger Reload
        CampaignStore->>API: Fetch Campaign (new currency)
        API-->>CampaignStore: Campaign Data
        CampaignStore->>CartStore: Notify Update
        CartStore->>CartStore: refreshItemPrices()
        CartStore->>CheckoutForm: Prices Updated
    end
    
    CheckoutForm->>User: Display Updated
```

## Error Handling & Fallbacks

```mermaid
graph TB
    Error([API Error/Timeout]) --> Check1{Location API Failed?}
    Check1 -->|Yes| FallbackLoc[Use US as default]
    Check1 -->|No| Check2{Country Config Failed?}
    
    Check2 -->|Yes| FallbackCountry[Use cached or default]
    Check2 -->|No| Check3{Campaign API Failed?}
    
    Check3 -->|Yes| FallbackCampaign[Use cached campaign]
    Check3 -->|No| Success[Continue Normal Flow]
    
    FallbackLoc --> DefaultCurrency[Default to USD]
    FallbackCountry --> DefaultCurrency
    FallbackCampaign --> UseCached[Use last known prices]
    
    style Error fill:#f44336,color:#fff
    style DefaultCurrency fill:#FF9800,color:#fff
    style UseCached fill:#2196F3,color:#fff
```