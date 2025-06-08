import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '29next Campaign Cart',
  description: 'JavaScript utility for connecting 29next campaigns with Webflow funnels',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/introduction/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      // Global sidebar - shown on all pages
      '/': [
        {
          text: '📖 Introduction',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/introduction/overview' },
            { text: 'Getting Started', link: '/introduction/getting-started' },
            { text: 'Core Concepts', link: '/introduction/core-concepts' }
          ]
        },
        {
          text: '⚙️ Configuration',
          collapsed: false,
          items: [
            { text: 'Basic Configuration', link: '/guides/configuration/basic-config' },
            { text: 'Form Validation', link: '/guides/configuration/form-validation' },
            { text: 'Google Autocomplete', link: '/guides/configuration/google-autocomplete' },
            { text: 'Payment Configuration', link: '/guides/configuration/payment-config' }
          ]
        },
        {
          text: '🛒 Shopping & Cart',
          collapsed: true,
          items: [
            { text: 'Shopping Cart', link: '/guides/features/shopping-cart' },
            { text: 'Product Profiles', link: '/guides/features/product-profiles' },
            { text: 'Selectors', link: '/guides/features/selectors' }
          ]
        },
        {
          text: '💳 Checkout & Payment',
          collapsed: true,
          items: [
            { text: 'Express Checkout', link: '/guides/features/express-checkout' },
            { text: 'Multi-Currency', link: '/guides/features/multi-currency' },
            { text: 'Receipt Pages', link: '/guides/features/receipt' }
          ]
        },
        {
          text: '🎯 Marketing Tools',
          collapsed: true,
          items: [
            { text: 'Timers', link: '/guides/features/timers' },
            { text: 'Vouchers & Discounts', link: '/guides/features/vouchers' },
            { text: 'Upsells', link: '/guides/features/upsells' }
          ]
        },
        {
          text: '🧪 Development',
          collapsed: true,
          items: [
            { text: 'Test Orders', link: '/guides/development/test-orders' }
          ]
        },
        {
          text: '📚 API Reference',
          collapsed: true,
          items: [
            { text: 'JavaScript API', link: '/api/javascript-api' },
            { text: 'HTML Attributes', link: '/api/html-attributes' },
            { text: 'Events Reference', link: '/api/events-reference' }
          ]
        },
        {
          text: '💡 Examples',
          collapsed: true,
          items: [
            { text: 'Basic Implementation', link: '/examples/basic-implementation' },
            { text: 'Interactive Cart Demo', link: '/examples/basic-cart.html', target: '_blank' },
            { text: 'Checkout Form Demo', link: '/examples/checkout-form.html', target: '_blank' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo/campaign-cart' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 29next'
    }
  }
})