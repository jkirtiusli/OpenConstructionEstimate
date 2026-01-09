/**
 * OpenConstructionEstimate - Hooks
 *
 * Central export for all custom hooks used in the application.
 * Organized by feature domain for easy discovery and import.
 */

// Work Items - Fetching and managing work items (partidas)
export {
  useWorkItems,
  usePrefetchWorkItems,
  useWorkItemsSearch,
  workItemsKeys,
  type WorkItem,
  type WorkItemsResponse,
  type UseWorkItemsOptions,
} from './useWorkItems';

// Cost Statistics - Analytics and aggregated data
export {
  useCostStats,
  useCostOverview,
  useCategoryBreakdown,
  useCostTrends,
  useFormattedStats,
  costStatsKeys,
  type CostOverview,
  type CategoryBreakdown,
  type CostTrendPoint,
  type CostStatsResponse,
  type UseCostStatsOptions,
} from './useCostStats';
