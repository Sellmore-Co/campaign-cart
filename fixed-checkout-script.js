/**
 * Fixed Checkout Script - Works with Country Switching
 * 
 * This script properly handles package ID translation and uses the correct
 * campaign data when countries are switched.
 */

<script>
window.on29NextReady = window.on29NextReady || [];
window.on29NextReady.push(function(client) {
  console.log("29next client is ready!");

  document.querySelectorAll('[data-action="checkout"]').forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();

      try {
        // Get the original package ID you want (from your HTML/configuration)
        const originalPackageId = "12";
        
        // Translate package ID using CountryCampaignManager if available
        let targetPackageId = originalPackageId;
        
        if (window.osCountryCampaignManager) {
          const currentCountry = window.osCountryCampaignManager.getCurrentCountry();
          const packageMaps = window.osConfig?.countryCampaigns?.packageMaps?.[currentCountry];
          
          if (packageMaps && packageMaps[originalPackageId] !== undefined) {
            targetPackageId = packageMaps[originalPackageId].toString();
            console.log(`Package translated: ${originalPackageId} → ${targetPackageId} for country ${currentCountry}`);
          }
        }

        // Get current campaign data (this is already the correct country's campaign)
        const campaignData = client.getCampaignData();
        
        if (!campaignData || !campaignData.packages) {
          console.error("Campaign data not available");
          return;
        }

        // Find the translated package in the current campaign
        const selectedPackage = campaignData.packages.find(pkg => 
          pkg.ref_id?.toString() === targetPackageId || 
          pkg.id?.toString() === targetPackageId
        );

        if (!selectedPackage) {
          console.warn(`Package ID ${targetPackageId} (original: ${originalPackageId}) not found in campaign data.`);
          console.log("Available packages:", campaignData.packages.map(p => ({ ref_id: p.ref_id, name: p.name })));
          return;
        }

        console.log("Selected package:", selectedPackage);

        // Clear the cart
        await client.cart.clearCart();

        // Add selected package to cart using the correct package data
        await client.cart.addToCart({
          id: selectedPackage.ref_id,
          name: selectedPackage.name,
          price: selectedPackage.price,
          quantity: 1,
          type: 'package'
        });

        console.log("Package added to cart successfully");

        // Redirect to checkout
        window.location.href = '/lem/checkout-sp01-lem-s2';

      } catch (error) {
        console.error("Error during checkout process:", error);
      }
    });
  });
});
</script> 