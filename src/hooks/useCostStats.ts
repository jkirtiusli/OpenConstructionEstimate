/**
 * OpenConstructionEstimate - useCostStats Hook
 *
 * React Query hook for fetching cost statistics and analytics.
 * Provides aggregated data for dashboards, charts, and summaries.
 *
 * Features:
 * - Region-aware statistics
 * - Multiple stat types (overview, trends, breakdown)
 * - Automatic caching and background refresh
 */

import { useQuery } from '@tanstack/react-query';
import { useRegionStore } from '@/lib/stores/regionStore';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

/**
 * Overview statistics for the dashboard
 */
export interface CostOverview {
  totalWorkItems: number;
  averageUnitCost: number;
  minCost: number;
  maxCost: number;
  categoryCount: number;
  lastUpdated: string;
}

/**
 * Cost breakdown by category
 */
export interface CategoryBreakdown {
  category: string;
  itemCount: number;
  totalValue: number;
  percentageOfTotal: number;
  averageCost: number;
}

/**
 * Historical cost trend data point
 */
export interface CostTrendPoint {
  period: string;
  averageCost: number;
  indexValue: number;
  changePercent: number;
}

/**
 * Full statistics response
 */
export interface CostStatsResponse {
  overview: CostOverview;
  categoryBreakdown: CategoryBreakdown[];
  trends?: CostTrendPoint[];
  meta: {
    region: string;
    currency: string;
    generatedAt: string;
  };
}

/**
 * Options for the useCostStats hook
 */
export interface UseCostStatsOptions {
  /** Include trend data (more expensive query) */
  includeTrends?: boolean;
  /** Time period for trends */
  trendPeriod?: 'month' | 'quarter' | 'year';
  /** Whether the query is enabled */
  enabled?: boolean;
}

/* ============================================
   QUERY KEY FACTORY
   ============================================ */

export const costStatsKeys = {
  all: ['costStats'] as const,
  overview: (region: string) => [...costStatsKeys.all, 'overview', region] as const,
  breakdown: (region: string) => [...costStatsKeys.all, 'breakdown', region] as const,
  trends: (region: string, period: string) =>
    [...costStatsKeys.all, 'trends', region, period] as const,
  full: (region: string, options: Omit<UseCostStatsOptions, 'enabled'>) =>
    [...costStatsKeys.all, 'full', region, options] as const,
};

/* ============================================
   FETCH FUNCTION
   ============================================ */

/**
 * Fetches cost statistics from the API
 */
async function fetchCostStats(
  region: string,
  options: Omit<UseCostStatsOptions, 'enabled'>
): Promise<CostStatsResponse> {
  const params = new URLSearchParams();

  params.set('region', region);

  if (options.includeTrends) {
    params.set('includeTrends', 'true');
    params.set('trendPeriod', options.trendPeriod ?? 'quarter');
  }

  const response = await fetch(`/api/stats?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch cost statistics');
  }

  return response.json();
}

/* ============================================
   MAIN HOOK
   ============================================ */

/**
 * Hook for fetching cost statistics with automatic region filtering.
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading } = useCostStats();
 *
 * // With trends
 * const { data } = useCostStats({ includeTrends: true });
 *
 * // Specific trend period
 * const { data } = useCostStats({
 *   includeTrends: true,
 *   trendPeriod: 'year'
 * });
 * ```
 */
export function useCostStats(options: UseCostStatsOptions = {}) {
  const { includeTrends = false, trendPeriod = 'quarter', enabled = true } = options;

  // Get current region from store
  const region = useRegionStore((s) => s.selectedRegion);

  // Build options for query key
  const queryOptions = { includeTrends, trendPeriod };

  return useQuery({
    queryKey: costStatsKeys.full(region, queryOptions),
    queryFn: () => fetchCostStats(region, queryOptions),
    enabled,
    // Stats can be cached longer since they don't change frequently
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/* ============================================
   SPECIALIZED HOOKS
   ============================================ */

/**
 * Hook for just the overview stats (lightweight)
 */
export function useCostOverview() {
  const { data, ...rest } = useCostStats({ includeTrends: false });

  return {
    overview: data?.overview,
    ...rest,
  };
}

/**
 * Hook for category breakdown
 */
export function useCategoryBreakdown() {
  const { data, ...rest } = useCostStats({ includeTrends: false });

  return {
    breakdown: data?.categoryBreakdown ?? [],
    ...rest,
  };
}

/**
 * Hook for cost trends
 */
export function useCostTrends(period: 'month' | 'quarter' | 'year' = 'quarter') {
  const { data, ...rest } = useCostStats({
    includeTrends: true,
    trendPeriod: period,
  });

  return {
    trends: data?.trends ?? [],
    ...rest,
  };
}

/* ============================================
   UTILITY HOOKS
   ============================================ */

/**
 * Hook for formatted currency values based on current region
 */
export function useFormattedStats() {
  const { data, isLoading, error } = useCostStats();
  const region = useRegionStore((s) => s.selectedRegion);

  // Get locale from region for formatting
  const getLocale = (regionCode: string): string => {
    const locales: Record<string, string> = {
      'es-barcelona': 'es-ES',
      'es-madrid': 'es-ES',
      'de-berlin': 'de-DE',
      'fr-paris': 'fr-FR',
      'en-london': 'en-GB',
      'en-toronto': 'en-CA',
      'ar-buenosaires': 'es-AR',
      'pt-saopaulo': 'pt-BR',
      'zh-shanghai': 'zh-CN',
    };
    return locales[regionCode] ?? 'en-US';
  };

  const formatCurrency = (value: number): string => {
    if (!data?.meta.currency) return value.toFixed(2);

    return new Intl.NumberFormat(getLocale(region), {
      style: 'currency',
      currency: data.meta.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(getLocale(region)).format(value);
  };

  return {
    data,
    isLoading,
    error,
    formatCurrency,
    formatNumber,
  };
}
