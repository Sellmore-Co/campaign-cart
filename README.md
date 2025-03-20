# Campaign Cart Documentation - Overview

## Introduction

Campaign Cart is a JavaScript library designed to provide ecommerce and checkout functionality for campaign websites. This document provides a brief overview of the main features and components available in the library.

## Core Features

### Main Initialization

- **Auto-initialization**: The library can be automatically initialized when the page loads.
- **Manual initialization**: The library can be manually initialized using the `TwentyNineNext` class.
- **Configuration**: Can be configured via meta tags or JavaScript options.
- **Event system**: Comprehensive event system for handling various events.

### Cart Management

- **Cart operations**: Add, remove, update items in cart
- **Cart UI integration**: Update cart counts, totals, items display
- **Price formatting**: Format prices according to currency settings
- **Coupon handling**: Apply and remove coupons
- **Shipping methods**: Set shipping methods
- **Cart state persistence**: Keep cart state across page loads
- **Cart API synchronization**: Sync cart with backend API

### Checkout Functionality

- **Form validation**: Validate checkout form fields
- **Payment processing**: Handle various payment methods
- **Address handling**: Manage shipping and billing addresses
- **Address autocomplete**: Google Maps integration for address autocomplete
- **Phone input formatting**: Format phone numbers for international usage
- **Prospect cart handling**: Manage abandoned carts with prospect data
- **Receipt page**: Display order receipt information

### UI Management

- **Selector management**: Find and manage DOM elements
- **Toggle management**: Toggle UI elements visibility
- **Display management**: Control display of various UI components
- **Cart display management**: Specifically manage cart display elements
- **Timer management**: Handle countdown timers for promotions
- **Debug UI**: Tools for debugging in development mode

### Attribution and Analytics

- **UTM parameter handling**: Track UTM parameters across the site
- **Attribution management**: Track attribution data for orders
- **Event tracking**: Track various events for analytics purposes

### Developer Tools

- **Debug mode**: Extensive debug information when enabled
- **Logging**: Comprehensive logging system
- **Konami code Easter egg**: Special development features accessible via konami code

## Manager Components

- **CartManager**: Handles cart operations
- **CheckoutManager**: Manages checkout process
- **AttributionManager**: Tracks attribution data
- **DebugManager**: Provides debugging tools
- **SelectorManager**: Finds and manages DOM elements
- **ToggleManager**: Toggles UI elements
- **EventManager**: Manages event system
- **StateManager**: Handles application state
- **CartDisplayManager**: Updates cart UI
- **TimerManager**: Manages countdown timers
- **DisplayManager**: Controls UI display

## Integration Components

- **ApiClient**: Communicates with backend API
- **PaymentHandler**: Processes payments
- **AddressHandler**: Manages shipping addresses
- **BillingAddressHandler**: Manages billing addresses
- **PaymentSelector**: Allows selection of payment methods
- **AddressAutocomplete**: Provides address autocomplete
- **PhoneInputHandler**: Formats phone numbers
- **ProspectCartHandler**: Handles abandoned carts

## Utility Functions

- **UTM Transfer**: Transfers UTM parameters across pages
- **PB Accordion**: Handles accordion UI components
- **Debug Utilities**: Tools for debugging
- **Konami Code Handler**: Easter egg functionality
- **Event Helper**: Assists with event handling
- **Spreedly Manager**: Integrates with Spreedly payment service
- **Logger**: Provides logging functionality

## Integration Guide

To integrate the library into your website:

1. Include the library on your page
2. Configure the library using meta tags or JavaScript options
3. Implement required HTML elements with data attributes
4. Initialize the library (automatic or manual)
5. Subscribe to events as needed

A more detailed integration guide will be provided in subsequent documentation. 