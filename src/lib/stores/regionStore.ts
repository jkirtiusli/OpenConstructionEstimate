/**
 * OpenConstructionEstimate - Region Store
 *
 * Zustand store for managing the selected region/locale with localStorage persistence.
 * Regions correspond to different cost databases (CYPE, RSMeans, etc.) and currencies.
 *
 * Supported regions:
 * - es-barcelona: Spain (Barcelona) - EUR
 * - es-madrid: Spain (Madrid) - EUR
 * - de-berlin: Germany (Berlin) - EUR
 * - fr-paris: France (Paris) - EUR
 * - en-london: UK (London) - GBP
 * - en-toronto: Canada (Toronto) - CAD
 * - ar-buenosaires: Argentina (Buenos Aires) - ARS
 * - pt-saopaulo: Brazil (Sao Paulo) - BRL
 * - zh-shanghai: China (Shanghai) - CNY
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

/**
 * Represents a supported region identifier
 */
export type RegionCode =
  | 'es-barcelona'
  | 'es-madrid'
  | 'de-berlin'
  | 'fr-paris'
  | 'en-london'
  | 'en-toronto'
  | 'ar-buenosaires'
  | 'pt-saopaulo'
  | 'zh-shanghai';

/**
 * Region metadata for display purposes
 */
export interface RegionInfo {
  code: RegionCode;
  city: string;
  country: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  locale: string;
}

/**
 * State shape for the region store
 */
interface RegionState {
  /** Currently selected region code */
  selectedRegion: RegionCode;
  /** Set the active region */
  setRegion: (region: RegionCode) => void;
}

/* ============================================
   REGION CONFIGURATION
   Complete metadata for all supported regions
   ============================================ */

export const REGIONS: Record<RegionCode, RegionInfo> = {
  'es-barcelona': {
    code: 'es-barcelona',
    city: 'Barcelona',
    country: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
  },
  'es-madrid': {
    code: 'es-madrid',
    city: 'Madrid',
    country: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'es-ES',
  },
  'de-berlin': {
    code: 'de-berlin',
    city: 'Berlin',
    country: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'de-DE',
  },
  'fr-paris': {
    code: 'fr-paris',
    city: 'Paris',
    country: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'fr-FR',
  },
  'en-london': {
    code: 'en-london',
    city: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    locale: 'en-GB',
  },
  'en-toronto': {
    code: 'en-toronto',
    city: 'Toronto',
    country: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
    locale: 'en-CA',
  },
  'ar-buenosaires': {
    code: 'ar-buenosaires',
    city: 'Buenos Aires',
    country: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
    currencySymbol: '$',
    locale: 'es-AR',
  },
  'pt-saopaulo': {
    code: 'pt-saopaulo',
    city: 'Sao Paulo',
    country: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
  },
  'zh-shanghai': {
    code: 'zh-shanghai',
    city: 'Shanghai',
    country: 'China',
    flag: '🇨🇳',
    currency: 'CNY',
    currencySymbol: '¥',
    locale: 'zh-CN',
  },
};

/**
 * Array of all region codes for iteration
 */
export const REGION_CODES = Object.keys(REGIONS) as RegionCode[];

/* ============================================
   STORE DEFINITION
   ============================================ */

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      // Default to Barcelona, Spain
      selectedRegion: 'es-barcelona',

      /**
       * Sets the active region
       * @param region - The region code to set
       */
      setRegion: (region: RegionCode) => {
        set({ selectedRegion: region });
      },
    }),
    {
      name: 'oce-region', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/* ============================================
   SELECTORS
   Performance-optimized selectors
   ============================================ */

/**
 * Select just the region code (avoids re-renders when other state changes)
 */
export const selectRegion = (state: RegionState) => state.selectedRegion;

/**
 * Get full region info for current selection
 */
export const selectRegionInfo = (state: RegionState): RegionInfo =>
  REGIONS[state.selectedRegion];

/* ============================================
   CONVENIENCE HOOKS
   ============================================ */

/**
 * Hook for accessing region with metadata
 */
export function useRegion() {
  const selectedRegion = useRegionStore(selectRegion);
  const setRegion = useRegionStore((state) => state.setRegion);
  const regionInfo = REGIONS[selectedRegion];

  return {
    selectedRegion,
    setRegion,
    regionInfo,
    allRegions: REGIONS,
    regionCodes: REGION_CODES,
  };
}

/**
 * Hook for just the currency formatting
 */
export function useRegionCurrency() {
  const selectedRegion = useRegionStore(selectRegion);
  const regionInfo = REGIONS[selectedRegion];

  /**
   * Format a number as currency for the current region
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(regionInfo.locale, {
      style: 'currency',
      currency: regionInfo.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return {
    currency: regionInfo.currency,
    currencySymbol: regionInfo.currencySymbol,
    locale: regionInfo.locale,
    formatCurrency,
  };
}
