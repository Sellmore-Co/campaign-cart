How to Set Up Global-E with Elevar Tracking
Learn more about Global-E and how to implement it with Elevar tracking.

Suggest Edits
🚧
This guide is for the third party Global E international checkout!

If you are using the unified Shopify checkout no additional work needed!

Overview
Follow this guide to learn how to set up Global-E with Elevar Tracking.

Understanding Global-E:
Global-E is an international checkout that typically takes the user outside the normal Shopify checkout flow.

During your implementation you typically have a "globale-tracking.liquid" snippet created. Depending on your implementation and what channels you may need to customize the below to your needs.

If you only need to add an Elevar Data Layer then it looks like this:

<!-- Global-e Script Elevar-->
<script>
var glegem = window["glegem"] || function() {(window["glegem"].q = window["glegem"].q || []).push(arguments);};
glegem("OnCheckoutStepLoaded", function(data) {
if (data.Steps.CONFIRMATION && data.IsSuccess) {
window.dataLayer = window.dataLayer || [];
console.log('ELEVAR - SUCCESS', data)     
 if(data.details.CustomerInfo) {
        // Push customer data
        window.dataLayer.push({
    "user_properties":{
          visitorId: data.details.CustomerInfo.MerchantUserId,
          customer_id: data.details.CustomerInfo.MerchantUserId,
          customer_email: data.details.customerEmail,
          customer_first_name: data.details.CustomerInfo.BillingAddress.FirstName,
          customer_last_name: data.details.CustomerInfo.BillingAddress.LastName,
          customer_phone: data.details.CustomerInfo.BillingAddress.Phone1,
          customer_city: data.details.CustomerInfo.BillingAddress.City,
          customer_zip: data.details.CustomerInfo.BillingAddress.ZipCode,
          customer_address_1: data.details.CustomerInfo.BillingAddress.Address1,
          customer_address_2: data.details.CustomerInfo.BillingAddress.Address2,
          customer_country: data.details.CustomerInfo.BillingAddress.CountryCode,
          customer_province: data.details.CustomerInfo.BillingAddress.StateProvinceRegion,
          customer_total_spent: data.details.customerTotalPrice,
        }});
        // End Push customer data

      } else {
        window.dataLayer.push({
         "user_properties":{
          customer_email: data.details.customerEmail,
          customer_first_name: data.details.customerName.split(" ")[0],
          customer_last_name: data.details.customerName.split(" ")[1],
          customer_country: data.details.country.name,
         customer_city: data.details.city,
          customer_province: data.details.region,
        }});
      }

      // Push order data
      window.dataLayer.push({
        pageType: "purchase",
        event_id: data.details.OrderReference,
        event: "dl_purchase",
        ecommerce: {
          currencyCode: data.details.customerCurrency,
          countryCode: data.details.country.code,
          purchase: {
            actionField: {
              id: data.details.OrderReference,
              order_name: data.details.OrderReference,
              revenue: data.details.customerTotalPrice,
              tax: data.details.customerTotalDuties,
              shipping: data.details.customerDiscountedShippingPrice,
              sub_total: data.details.customerTotalPrice - data.details.customerDiscountedShippingPrice - data.details.customerTotalDuties,
              affiliation: "Global-E",
              discountAmount: data.details.totalDiscountsPrice,
              coupon: data.details.discounts.filter(function(discount){
                return discount.couponCode
              }).map(function(discount){
                return discount.couponCode
              }).join(', ')
            },
            products: data.details.products.map(function(item) {
              return {
                name: item.name,
                id: item.sku,
                product_id: item.productGroupCode,
                variant_id: item.sku,
                price: item.price,
                brand: item.Brand ? item.Brand.Name : "",
                category: item.categories.filter(function(category){
                  return category.name
                }).map(function(category){
                  return category.name
                }).join(', '),
                variant: item.name,
                quantity: item.quantity
              }
            })}
        }
      });
    // End Push order data
    }
});
</script>
Or if you need to hardcode specific trackers into the file AND include the Elevar data layer then it may look like this:

<script>
var glegem = glegem || function(){(window["glegem"].q = window["glegem"].q || []).push(arguments)};
glegem("OnCheckoutStepLoaded",function(data){
 switch(data.StepId){
  case data.Steps.LOADED:
      break;
  case data.Steps.CONFIRMATION:
     if (data.IsSuccess && !data.IsPageReload){

        var totalCartDiscount = 0;
        var totalOriginalCartDiscount = 0;
        for(i=0;i<data.details.discounts.length;i++){
          if(data.details.discounts[i].discountTypeId == 1){
            totalCartDiscount = totalCartDiscount + data.details.discounts[i].customerPrice;
            totalOriginalCartDiscount = totalOriginalCartDiscount + data.details.discounts[i].price;
          }
        }
       // Start of GA Ecommerce
       (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
         (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
         m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                               })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

       ga('create', 'UA-111111-1', 'auto');

       ga('require','ecommerce');

       ga('ecommerce:addTransaction', {
         'id': data.OrderId,
         'affiliation': 'Global-E',
         'revenue': data.details.totalProductsPrice - totalOriginalCartDiscount,
         'shipping': data.details.discountedShippingPrice ,
         'tax': data.details.totalVAT,
         'currency': data.details.currency
       });

       for(i=0;i<data.details.products.length;i++){
         ga('ecommerce:addItem', {
           'id': data.OrderId,
           'name': data.details.products[i].name,
           'sku':data.details.products[i].sku,
           'category': data.details.products[i].categories.length ? data.details.products[i].categories[0].name : '',
           'price': data.details.products[i].price,
           'quantity': data.details.products[i].quantity,
           'currency': data.details.currency
         });
       }
       ga('ecommerce:send');
       
       // FB pixel - checkout completed
        fbq('init', '111111');
        fbq('track', 'Purchase', {
        value: data.details.totalProductsPrice - totalOriginalCartDiscount,
        currency: data.details.currency
        });
       
            // TikTok pixel - purchase

                    ttq.instance('11111111111').track('Purchase', {
                        currency: data.details.currency,
                        value: data.details.totalProductsPrice - totalOriginalCartDiscount,
                      });
       
       // End of GA Ecommerce
       // Push order data
          window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
            pageType: "purchase",
            event: "dl_globale_purchase",
            event_id: data.details.OrderReference,
                        user_properties:{
                                customer_id: data.details.CustomerInfo.MerchantUserId,
                                customer_email: data.details.customerEmail,
                                customer_first_name: data.details.CustomerInfo.BillingAddress.FirstName,
                                customer_phone: "",
                                customer_last_name: data.details.CustomerInfo.BillingAddress.LastName,
                                customer_city: data.details.CustomerInfo.BillingAddress.City,
                                customer_zip: data.details.CustomerInfo.BillingAddress.ZipCode,
                                customer_address_1: data.details.CustomerInfo.BillingAddress.Address1,
                                customer_address_2: data.details.CustomerInfo.BillingAddress.Address2,
                                customer_country: data.details.CustomerInfo.BillingAddress.CountryCode,
                                customer_province: data.details.CustomerInfo.BillingAddress.StateProvinceRegion
                                },
                        ecommerce: {
              currencyCode: data.details.currency,
              countryCode: data.details.country.code,
              purchase: {
                actionField: {
                  id: data.details.OrderReference,
                  sub_total: data.details.totalProductsPrice - totalOriginalCartDiscount,
                  revenue: data.details.totalProductsPrice - totalOriginalCartDiscount,
                  tax: data.details.customerTotalDuties,
                  shipping: data.details.customerDiscountedShippingPrice,
                  affiliation: "",
                  discountAmount: data.details.totalDiscountsPrice,
                  coupon: data.details.discounts.filter(function(discount){
                    return discount.couponCode
                  }).map(function(discount){
                    return discount.couponCode
                  }).join(', ')
                },
                products: data.details.products.map(function(item) {
                  return {
                    name: item.name,
                    id: item.sku,
                    product_id: item.productGroupCode,
                    variant_id: item.sku,
                    price: item.price,
                    brand: item.Brand ? item.Brand.Name : "",
                    category: item.categories.filter(function(category){
                      return category.name
                    }).map(function(category){
                      return category.name
                    }).join(', '),
                    variant: item.name,
                    quantity: item.quantity
                  }
                })}
            }
          });
        // End Push order data

     }}});
</script>
🚧
Be sure to put GTM into Preview mode to validate your tracking works as expected!