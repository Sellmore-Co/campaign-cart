# Cart Functions

This document describes the available cart functions in the Campaign Cart library, including methods to add items to the cart.

## Adding Items to Cart

There are multiple ways to add products to the cart, depending on your needs.

### Standard Method: `addToCart`

The basic method to add an item to the cart:

```javascript
client.cart.addToCart({
  id: "1",              // Required: Product ID or package ID 
  name: "Product Name", // Optional if ID exists in campaign data
  price: 59.99,         // Optional if ID exists in campaign data
  quantity: 1,          // Optional, defaults to 1
  type: "package"       // Optional, helps identify the item type
});
```

#### Parameters:

- `id` (string, required): The product ID. This can be either a ref_id or an external_id from campaign data.
- `name` (string, optional): The product name. If not provided but ID exists in campaign data, it will be auto-populated.
- `price` (number, optional): The product price. If not provided but ID exists in campaign data, it will be auto-populated.
- `quantity` (number, optional): The quantity to add. Defaults to 1 if not specified.
- `type` (string, optional): The type of product (e.g., "package", "addon").

#### Notes:

- If the product already exists in the cart, its quantity will be increased instead of adding a duplicate.
- The system will first try to match by `ref_id`, and if no match is found, it will try to match by `external_id`.
- When providing just the `id`, the system will auto-populate name, price, and other details from campaign data if available.

### Ref ID Method: `addToCartByRefId`

A simplified method to add an item to the cart using only its ref_id:

```javascript
client.cart.addToCartByRefId("16", 1);
```

#### Parameters:

- `refId` (string, required): The ref_id from campaign data. This must match exactly with a package's ref_id.
- `quantity` (number, optional): The quantity to add. Defaults to 1 if not specified.

#### Notes:

- This method only matches by ref_id and ignores external_id, ensuring the exact package is added.
- All product details (name, price, image, etc.) will be automatically populated from campaign data.
- This is the preferred method when you want to guarantee adding a specific package by its ref_id.

## Example Usage

### Adding a Single Item with All Details

```javascript
client.cart.addToCart({
  id: "product_123",
  name: "Premium Product",
  price: 29.99,
  quantity: 2,
  type: "standard"
});
```

### Adding an Item with Auto-populated Details

```javascript
// The system will find name, price, etc. from campaign data
client.cart.addToCart({
  id: "5",
  quantity: 1
});
```

### Adding Multiple Items in a Loop

```javascript
// Add free eBooks by explicitly using ref_ids
const freeEbooks = campaignData.packages.filter(pkg => 
  pkg.name.includes('Gift Ebook') && 
  parseFloat(pkg.price) === 0
);

freeEbooks.forEach(ebook => {
  client.cart.addToCartByRefId(ebook.ref_id);
  console.log(`Added free eBook to cart: ${ebook.name} (ref_id: ${ebook.ref_id})`);
});
```

## Common Issues

### Wrong Product Added

If you're trying to add a product by its ref_id but getting a different product instead, it's likely because:

1. You're using `addToCart()` with just an ID, and the system is matching by external_id instead of ref_id
2. The ref_id you're using doesn't match what's in the campaign data

Solution: Use `addToCartByRefId()` instead, which guarantees matching only by ref_id.

### Missing Product Details

If product details like name or price aren't showing correctly in the cart:

1. Ensure the product exists in campaign data with correct details
2. Check that the ref_id or external_id you're using exactly matches what's in campaign data
3. For debugging, you can directly inspect `client.getCampaignData().packages` to view all available products 