/**
 * Parameter Store - Zustand store for managing URL parameters across the session
 *
 * This store captures and persists URL parameters to enable dynamic content
 * visibility based on parameters like ?seen=n, ?timer=n, etc.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLogger } from '@/utils/logger';

const logger = createLogger('ParameterStore');

export interface ParameterState {
  // Core state
  params: Record<string, string>;

  // Actions
  updateParam: (key: string, value: string) => void;
  updateParams: (params: Record<string, string>) => void;
  mergeParams: (params: Record<string, string>) => void;
  getParam: (key: string) => string | undefined;
  hasParam: (key: string) => boolean;
  clearParams: () => void;
  removeParam: (key: string) => void;
  debug: () => void;
}

export const useParameterStore = create<ParameterState>()(
  persist(
    (set, get) => ({
      params: {},

      updateParam: (key, value) => {
        set(state => ({
          params: { ...state.params, [key]: value }
        }));
        logger.debug(`Parameter updated: ${key} = ${value}`);
      },

      updateParams: (params) => {
        set({ params });
        logger.debug('Parameters replaced:', params);
      },

      mergeParams: (params) => {
        set(state => ({
          params: { ...state.params, ...params }
        }));
        logger.debug('Parameters merged:', params);
      },

      getParam: (key) => {
        const state = get();
        return state.params[key];
      },

      hasParam: (key) => {
        const state = get();
        return key in state.params;
      },

      clearParams: () => {
        set({ params: {} });
        logger.info('All parameters cleared');
      },

      removeParam: (key) => {
        set(state => {
          const newParams = { ...state.params };
          delete newParams[key];
          return { params: newParams };
        });
        logger.debug(`Parameter removed: ${key}`);
      },

      debug: () => {
        const state = get();
        console.group('🔍 URL Parameters Debug Info');

        const paramCount = Object.keys(state.params).length;
        console.log(`📊 Total parameters: ${paramCount}`);

        if (paramCount > 0) {
          console.log('\n📋 Current parameters:');
          console.table(state.params);

          // Group parameters by common prefixes
          const grouped: Record<string, string[]> = {};
          Object.entries(state.params).forEach(([key, value]) => {
            const prefix = key.includes('_') ? key.split('_')[0] : 'other';
            if (!grouped[prefix]) grouped[prefix] = [];
            grouped[prefix].push(`${key}=${value}`);
          });

          console.log('\n🗂️ Parameters by prefix:');
          Object.entries(grouped).forEach(([prefix, params]) => {
            console.log(`  ${prefix}: ${params.join(', ')}`);
          });
        } else {
          console.log('No parameters currently stored');
        }

        // Show current URL parameters for comparison
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentParams: Record<string, string> = {};
        currentUrlParams.forEach((value, key) => {
          currentParams[key] = value;
        });

        if (Object.keys(currentParams).length > 0) {
          console.log('\n🔗 Current URL parameters:');
          console.table(currentParams);

          // Show differences
          const storedKeys = new Set(Object.keys(state.params));
          const urlKeys = new Set(Object.keys(currentParams));

          const onlyInStore = Array.from(storedKeys).filter(k => !urlKeys.has(k));
          const onlyInUrl = Array.from(urlKeys).filter(k => !storedKeys.has(k));
          const different = Array.from(storedKeys).filter(k =>
            urlKeys.has(k) && state.params[k] !== currentParams[k]
          );

          if (onlyInStore.length > 0 || onlyInUrl.length > 0 || different.length > 0) {
            console.log('\n⚠️ Differences:');
            if (onlyInStore.length > 0) {
              console.log('  Only in store:', onlyInStore);
            }
            if (onlyInUrl.length > 0) {
              console.log('  Only in URL:', onlyInUrl);
            }
            if (different.length > 0) {
              console.log('  Different values:', different);
            }
          }
        }

        console.groupEnd();
        return 'Parameter debug info logged to console.';
      }
    }),
    {
      name: 'next-url-params',
      storage: {
        getItem: (name) => {
          try {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch (error) {
            logger.error('Error reading from sessionStorage:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            sessionStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            logger.error('Error writing to sessionStorage:', error);
          }
        },
        removeItem: (name) => {
          try {
            sessionStorage.removeItem(name);
          } catch (error) {
            logger.error('Error removing from sessionStorage:', error);
          }
        }
      }
    }
  )
);