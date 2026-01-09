/**
 * Region configuration for construction cost data sources
 * Each region maps to a Parquet file containing work items, costs, and resources
 */

export const REGIONS = {
  'ar-dubai': {
    code: 'AR',
    city: 'Dubai',
    file: 'AR___DDC_CWICR/AR_DUBAI_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'AED',
    locale: 'ar-AE'
  },
  'de-berlin': {
    code: 'DE',
    city: 'Berlin',
    file: 'DE___DDC_CWICR/DE_BERLIN_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'EUR',
    locale: 'de-DE'
  },
  'en-toronto': {
    code: 'EN',
    city: 'Toronto',
    file: 'EN___DDC_CWICR/ENG_TORONTO_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'CAD',
    locale: 'en-CA'
  },
  'es-barcelona': {
    code: 'ES',
    city: 'Barcelona',
    file: 'ES___DDC_CWICR/SP_BARCELONA_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'EUR',
    locale: 'es-ES'
  },
  'fr-paris': {
    code: 'FR',
    city: 'Paris',
    file: 'FR___DDC_CWICR/FR_PARIS_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'EUR',
    locale: 'fr-FR'
  },
  'hi-mumbai': {
    code: 'HI',
    city: 'Mumbai',
    file: 'HI___DDC_CWICR/HI_MUMBAI_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'INR',
    locale: 'hi-IN'
  },
  'pt-saopaulo': {
    code: 'PT',
    city: 'Sao Paulo',
    file: 'PT___DDC_CWICR/PT_SAOPAULO_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'BRL',
    locale: 'pt-BR'
  },
  'ru-stpetersburg': {
    code: 'RU',
    city: 'St. Petersburg',
    file: 'RU___DDC_CWICR/RU_STPETERSBURG_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'RUB',
    locale: 'ru-RU'
  },
  'zh-shanghai': {
    code: 'ZH',
    city: 'Shanghai',
    file: 'ZH___DDC_CWICR/ZH_SHANGHAI_workitems_costs_resources_DDC_CWICR.parquet',
    currency: 'CNY',
    locale: 'zh-CN'
  },
} as const;

export type RegionKey = keyof typeof REGIONS;
export type RegionConfig = typeof REGIONS[RegionKey];

export const DEFAULT_REGION: RegionKey = 'es-barcelona';

/**
 * Get all region keys
 */
export function getRegionKeys(): RegionKey[] {
  return Object.keys(REGIONS) as RegionKey[];
}

/**
 * Get region config by key, with validation
 */
export function getRegionConfig(key: string): RegionConfig | null {
  if (key in REGIONS) {
    return REGIONS[key as RegionKey];
  }
  return null;
}

/**
 * Validate if a string is a valid region key
 */
export function isValidRegion(key: string): key is RegionKey {
  return key in REGIONS;
}
