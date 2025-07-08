# Test Order Types

This document outlines the different types of test orders available in the checkout system.

## 1. Konami Code Test Mode
- **Activation**: Enter the Konami code sequence (↑↑↓↓←→←→BA)
- **Behavior**:
  - Bypasses form validation
  - Uses predefined test data for shipping/billing
  - Uses specific test card: `6011111111111117` (Discover)
  - No actual transaction is created
  - Clears test mode after each use
- **Use Case**: Quick testing without form validation or real transactions

## 2. Regular Test Mode
- **Activation**: Add `?test=true` to the URL
- **Behavior**:
  - Validates all form fields
  - Uses `test_card` token for payment
  - Bypasses Spreedly validation
  - Creates test order without real transaction
- **Use Case**: Testing the full checkout flow with validation

## Test Card Numbers
The system includes predefined test cards for different card types:
- Visa: `4111111111111111`
- Mastercard: `5555555555554444`
- American Express: `378282246310005`
- Discover: `6011111111111117`

## Important Notes
1. Test modes should only be used in development/testing environments
2. Konami code mode is the most permissive, bypassing all validation
