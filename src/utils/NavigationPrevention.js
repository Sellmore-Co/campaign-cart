export function preventBack() {
    window.history.forward();
}

// Save upsell acceptance info to sessionStorage
export function saveAcceptedUpsell(packageId, nextUrl) {
    try {
        // Store that an upsell was accepted and the URL to return to
        sessionStorage.setItem('upsell_accepted', 'true');
        sessionStorage.setItem('upsell_package_id', packageId.toString());
        sessionStorage.setItem('upsell_next_url', nextUrl);
        
        // Store current timestamp to potentially expire this data later
        sessionStorage.setItem('upsell_accepted_time', Date.now().toString());
    } catch (error) {
        console.error('Error saving upsell data to sessionStorage:', error);
    }
}

// Check if user has an accepted upsell and handle back navigation
export function handleBackNavigation() {
    // If we have an accepted upsell, redirect on popstate (back button)
    if (sessionStorage.getItem('upsell_accepted') === 'true') {
        window.addEventListener('popstate', function(event) {
            const nextUrl = sessionStorage.getItem('upsell_next_url');
            if (nextUrl) {
                // Redirect to the stored next URL, preserving debug parameters
                const currentUrlParams = new URLSearchParams(window.location.search);
                const hasDebug = currentUrlParams.has('debug') && currentUrlParams.get('debug') === 'true';
                
                // Create redirect URL with debug parameter if needed
                let redirectUrl = nextUrl;
                if (hasDebug) {
                    // Check if nextUrl already has parameters
                    if (redirectUrl.includes('?')) {
                        redirectUrl += '&debug=true';
                    } else {
                        redirectUrl += '?debug=true';
                    }
                }
                
                window.location.href = redirectUrl;
            }
        });
    }
}

// Check URL for debug parameter
export function hasDebugParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('debug') && urlParams.get('debug') === 'true';
}

// Create the next URL with debug parameter preserved if needed
export function createNextUrlWithDebug(nextUrl) {
    if (!nextUrl) return nextUrl;
    
    if (hasDebugParameter()) {
        // Check if nextUrl already has parameters
        if (nextUrl.includes('?')) {
            return `${nextUrl}&debug=true`;
        } else {
            return `${nextUrl}?debug=true`;
        }
    }
    
    return nextUrl;
}

export function initNavigationPrevention() {
    // Prevent back button with traditional approach
    setTimeout(preventBack, 0);
    window.onunload = function () {};
    
    // Set up back navigation handler for upsells
    handleBackNavigation();
}

// For backward compatibility if this file is loaded via script tag
setTimeout(preventBack, 0);
window.onunload = function () {};