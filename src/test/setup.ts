/**
 * Test setup file for Vitest
 */

import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Setup global test environment
beforeEach(() => {
  // Clear DOM
  document.body.innerHTML = '';
  
  // Reset window.nextConfig
  if (typeof window !== 'undefined') {
    (window as any).nextConfig = undefined;
  }
});