// Function to create and manage the exit-intent modal
function initExitIntentModal() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Dark overlay
    overlay.style.zIndex = '999';
    overlay.style.display = 'none';
    document.body.appendChild(overlay);

    // Create modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '1000';
    modal.style.display = 'none';
    modal.style.cursor = 'pointer'; // Indicate the image is clickable
    document.body.appendChild(modal);

    // Add the image to the modal
    const modalImage = document.createElement('img');
    modalImage.src = 'https://cdn.prod.website-files.com/67ec42fd75dae41c564624c5/67f95c437b2e3eab071a8138_exit-popup%20(3).png';
    modalImage.style.maxWidth = '100%';
    modalImage.style.height = 'auto';
    modal.appendChild(modalImage);

    // Flag to prevent multiple triggers
    let hasTriggered = false;

    // Mouse move event to detect exit intent
    document.addEventListener('mousemove', function (e) {
        if (!hasTriggered && e.clientY <= 10) { // Trigger when mouse is near the top
            overlay.style.display = 'block';
            modal.style.display = 'block';
            hasTriggered = true; // Prevent re-triggering
        }
    });

    // Click event on the modal image to apply coupon and close
    modal.addEventListener('click', function () {
        // Apply the coupon code
        if (window.twentyNineNext && window.twentyNineNext.cart) {
            window.twentyNineNext.cart.applyCoupon('HANACURE5', 'percentage', 5);
        } else {
            console.warn('twentyNineNext.cart is not available.');
        }
        // Close modal and overlay
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Optional: Close modal when clicking outside (on overlay)
    overlay.addEventListener('click', function () {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    });
}

// Initialize the modal when the DOM is fully loaded
initExitIntentModal();