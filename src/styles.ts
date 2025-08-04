/**
 * CSS Entry Point
 * 
 * Import this file separately if you want to use the Campaign Cart styles.
 * This allows you to control when and how CSS is loaded.
 */

// Main styles
import './styles/main.css';

// Component styles
import './styles/components/cart.css';
import './styles/components/checkout.css';

// Export a marker to indicate styles are loaded
export const stylesLoaded = true;