/**
 * OpenConstructionEstimate - useWorkItems Hook
 *
 * React Query hook for fetching work items (partidas) from the API.
 * Automatically includes the current region in the query and
 * re-fetches when the region changes.
 *
 * Features:
 * - Automatic region-based filtering
 * - Pagination support
 * - Search functionality
 * - Category filtering
 * - Optimistic cache updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRegionStore } from '@/lib/stores/regionStore';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

/**
 * Work item (partida) from the cost database
 */
export interface WorkItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  unitCost: number;
  laborCost: number;
  materialCost: number;
  equipmentCost: number;
  category: string;
  subcategory?: string;
  region: string;
  lastUpdated: string;
}

/**
 * Paginated response structure
 */
export interface WorkItemsResponse {
  data: WorkItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: {
    region: string;
    query?: string;
    category?: string;
  };
}

/**
 * Options for the useWorkItems hook
 */
export interface UseWorkItemsOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Search query string */
  search?: string;
  /** Filter by category */
  category?: string;
  /** Whether the query is enabled */
  enabled?: boolean;
}

/* ============================================
   QUERY KEY FACTORY
   Consistent key generation for cache management
   ============================================ */

export const workItemsKeys = {
  all: ['workitems'] as const,
  lists: () => [...workItemsKeys.all, 'list'] as const,
  list: (region: string, filters: Omit<UseWorkItemsOptions, 'enabled'>) =>
    [...workItemsKeys.lists(), region, filters] as const,
  details: () => [...workItemsKeys.all, 'detail'] as const,
  detail: (id: string) => [...workItemsKeys.details(), id] as const,
};

/* ============================================
   FETCH FUNCTION
   ============================================ */

/**
 * Fetches work items from the API
 */
async function fetchWorkItems(
  region: string,
  options: Omit<UseWorkItemsOptions, 'enabled'>
): Promise<WorkItemsResponse> {
  const params = new URLSearchParams();

  // Always include region
  params.set('region', region);

  // Pagination
  params.set('page', String(options.page ?? 1));
  params.set('limit', String(options.limit ?? 100));

  // Optional filters
  if (options.search) {
    params.set('search', options.search);
  }
  if (options.category) {
    params.set('category', options.category);
  }

  const response = await fetch(`/api/workitems?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch work items');
  }

  return response.json();
}

/* ============================================
   MAIN HOOK
   ============================================ */

/**
 * Hook for fetching work items with automatic region filtering.
 *
 * @example
 * ```tsx
 * // Basic usage - fetches for current region
 * const { data, isLoading } = useWorkItems();
 *
 * // With search
 * const { data } = useWorkItems({ search: 'hormigon' });
 *
 * // With pagination
 * const { data } = useWorkItems({ page: 2, limit: 50 });
 * ```
 */
export function useWorkItems(options: UseWorkItemsOptions = {}) {
  const { page = 1, limit = 100, search, category, enabled = true } = options;

  // Get current region from store
  const region = useRegionStore((s) => s.selectedRegion);

  // Build filter object for query key
  const filters = { page, limit, search, category };

  return useQuery({
    queryKey: workItemsKeys.list(region, filters),
    queryFn: () => fetchWorkItems(region, filters),
    enabled,
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });
}

/* ============================================
   PREFETCH HOOK
   For optimistic data loading
   ============================================ */

/**
 * Hook for prefetching work items (e.g., for next page)
 */
export function usePrefetchWorkItems() {
  const queryClient = useQueryClient();
  const region = useRegionStore((s) => s.selectedRegion);

  /**
   * Prefetch work items for given options
   */
  const prefetch = async (options: Omit<UseWorkItemsOptions, 'enabled'>) => {
    const filters = {
      page: options.page ?? 1,
      limit: options.limit ?? 100,
      search: options.search,
      category: options.category,
    };

    await queryClient.prefetchQuery({
      queryKey: workItemsKeys.list(region, filters),
      queryFn: () => fetchWorkItems(region, filters),
    });
  };

  return { prefetch };
}

/* ============================================
   SEARCH HOOK
   Dedicated hook for search functionality
   ============================================ */

/**
 * Hook optimized for search with debouncing handled externally
 */
export function useWorkItemsSearch(search: string) {
  return useWorkItems({
    search: search.length >= 2 ? search : undefined,
    limit: 50,
    enabled: search.length >= 2,
  });
}

/* ============================================
   MUTATION HOOKS (placeholder for future)
   ============================================ */

// TODO: Add mutation hooks for CRUD operations when API supports them
// export function useCreateWorkItem() { ... }
// export function useUpdateWorkItem() { ... }
// export function useDeleteWorkItem() { ... }
