# Changelog

## 2025-09-06

### Changed

-   **Updated Express Checkout Button Logic**

    The logic for displaying the Apple Pay and Google Pay express checkout buttons has been modified to better support a QR code-based payment workflow.

    #### Before

    The visibility of the Apple Pay and Google Pay buttons was strictly determined by the browser's native support for these payment methods.

    -   **Apple Pay:** The button would only appear on Apple devices using the Safari browser, which provides the necessary `window.ApplePaySession` object.
    -   **Google Pay:** The button would only appear on browsers that expose the `window.chrome` object, primarily affecting Google Chrome and other Chromium-based browsers.

    This approach ensured that users would only see a payment option if they could complete the transaction directly on their current device.

    #### Now

    The display logic for these buttons is now based solely on the screen size of the user's device.

    -   **New Rule:** The Apple Pay and Google Pay buttons will now be displayed on **any device** where the screen width is greater than `786px`.
    -   **Reasoning:** This change was implemented to support a new payment flow where users on desktop devices are presented with a QR code. They can then scan this code with their mobile phone to complete the payment using Apple Pay or Google Pay on their handheld device. The browser-specific checks were removed, as they are not relevant to this handoff process. 