import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '29next Campaign Cart',
  description: 'JavaScript utility for connecting 29next campaigns with Webflow funnels',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Guides', link: '/guides/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Examples', link: '/examples/' }
    ],

    sidebar: {
      '/introduction/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/introduction/overview' },
            { text: 'Core Concepts', link: '/introduction/core-concepts' },
            { text: 'Getting Started', link: '/introduction/getting-started' }
          ]
        }
      ],
      
      '/guides/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Basic Configuration', link: '/guides/configuration/basic-config' },
            { text: 'Form Validation', link: '/guides/configuration/form-validation' },
            { text: 'Google Autocomplete', link: '/guides/configuration/google-autocomplete' },
            { text: 'Payment Configuration', link: '/guides/configuration/payment-config' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Shopping Cart', link: '/guides/features/shopping-cart' },
            { text: 'Express Checkout', link: '/guides/features/express-checkout' },
            { text: 'Multi-Currency', link: '/guides/features/multi-currency' },
            { text: 'Product Profiles', link: '/guides/features/product-profiles' },
            { text: 'Receipt', link: '/guides/features/receipt' },
            { text: 'Selectors', link: '/guides/features/selectors' },
            { text: 'Timers', link: '/guides/features/timers' },
            { text: 'Upsells', link: '/guides/features/upsells' },
            { text: 'Vouchers', link: '/guides/features/vouchers' }
          ]
        },
        {
          text: 'Development',
          items: [
            { text: 'Test Orders', link: '/guides/development/test-orders' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Events Reference', link: '/api/events-reference' },
            { text: 'HTML Attributes', link: '/api/html-attributes' },
            { text: 'JavaScript API', link: '/api/javascript-api' }
          ]
        }
      ],

      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Implementation', link: '/examples/basic-implementation' }
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