// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: '29next Campaign Cart',
			description: 'A JavaScript SDK for connecting the 29next API to your page builder.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/29next/campaign-cart' }
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'Overview', slug: 'introduction/overview' },
						{ label: 'Getting Started', slug: 'introduction/getting-started' },
						{ label: 'Core Concepts', slug: 'introduction/core-concepts' },
					],
				},
				{
					label: 'Configuration',
					items: [
						{ label: 'Basic Configuration', slug: 'guides/configuration/basic-config' },
						{ label: 'Form Validation', slug: 'guides/configuration/form-validation' },
						{ label: 'Google Autocomplete', slug: 'guides/configuration/google-autocomplete' },
						{ label: 'Page Types', slug: 'guides/configuration/page-types' },
						{ label: 'Payment Configuration', slug: 'guides/configuration/payment-config' },
					],
				},
				{
					label: 'Features',
					items: [
						{ label: 'Shopping Cart', slug: 'guides/features/shopping-cart' },
						{ label: 'Product Profiles', slug: 'guides/features/product-profiles' },
						{ label: 'Express Checkout', slug: 'guides/features/express-checkout' },
						{ label: 'Multi-Currency', slug: 'guides/features/multi-currency' },
						{ label: 'Selectors', slug: 'guides/features/selectors' },
						{ label: 'Timers', slug: 'guides/features/timers' },
						{ label: 'Toggles', slug: 'guides/features/toggles' },
						{ label: 'Vouchers', slug: 'guides/features/vouchers' },
						{ label: 'Upsells', slug: 'guides/features/upsells' },
						{ label: 'Receipt', slug: 'guides/features/receipt' },
					],
				},
				{
					label: 'Development',
					items: [
						{ label: 'Test Orders', slug: 'guides/development/test-orders' },
					],
				},
				{
					label: 'API Reference',
					items: [
						{ label: 'JavaScript API', slug: 'api/javascript-api' },
						{ label: 'HTML Attributes', slug: 'api/html-attributes' },
						{ label: 'Events Reference', slug: 'api/events-reference' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Basic Implementation', slug: 'examples/basic-implementation' },
					],
				},
			],
		}),
	],
});
