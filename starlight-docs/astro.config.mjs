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
					label: 'Getting Started',
					items: [
						{ label: 'Overview', slug: 'introduction/overview' },
						{ label: 'Quick Start', slug: 'introduction/quick-start' },
						{ label: 'Your First Checkout', slug: 'introduction/first-checkout' },
						{ label: 'Core Concepts', slug: 'introduction/core-concepts' },
					],
				},
				{
					label: 'Essentials',
					items: [
						{ label: 'Installation & Setup', slug: 'essentials/installation' },
						{ label: 'HTML Attributes', slug: 'essentials/html-attributes' },
						{ label: 'Testing Guide', slug: 'essentials/testing' },
						{ label: 'Troubleshooting', slug: 'essentials/troubleshooting' },
					],
				},
				{
					label: 'Cart & Products',
					items: [
						{ label: 'Shopping Cart', slug: 'guides/features/shopping-cart' },
						{ label: 'Selectors (Choose One)', slug: 'guides/features/selectors' },
						{ label: 'Toggles (Add-ons)', slug: 'guides/features/toggles' },
						{ label: 'Product Profiles', slug: 'guides/features/product-profiles' },
					],
				},
				{
					label: 'Checkout & Payments',
					items: [
						{ label: 'Express Checkout', slug: 'guides/features/express-checkout' },
						{ label: 'Form Validation', slug: 'guides/configuration/form-validation' },
						{ label: 'Google Autocomplete', slug: 'guides/configuration/google-autocomplete' },
						{ label: 'Payment Configuration', slug: 'guides/configuration/payment-config' },
					],
				},
				{
					label: 'Revenue & Marketing',
					items: [
						{ label: 'Multi-Currency', slug: 'guides/features/multi-currency' },
						{ label: 'Vouchers & Discounts', slug: 'guides/features/vouchers' },
						{ label: 'Upsells', slug: 'guides/features/upsells' },
						{ label: 'Timers & Urgency', slug: 'guides/features/timers' },
						{ label: 'Receipt Pages', slug: 'guides/features/receipt' },
					],
				},
				{
					label: 'Configuration',
					items: [
						{ label: 'Basic Configuration', slug: 'guides/configuration/basic-config' },
						{ label: 'Page Types', slug: 'guides/configuration/page-types' },
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
						{ label: 'Events Reference', slug: 'api/events-reference' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Basic Implementation', slug: 'examples/basic-implementation' },
					],
				},
				{
					label: 'Release Notes',
					items: [
						{ label: 'Changelog', slug: 'changelog' },
					],
				},
			],
		}),
	],
});