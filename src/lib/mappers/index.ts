/**
 * OpenConstructionEstimate - Mappers Index
 *
 * Central export point for all data mapping utilities.
 *
 * @module lib/mappers
 */

// Work Item Mappers - Primary transformation utilities
export {
  // Core mappers
  mapToConstructionItem,
  mapToWorkItemDisplay,
  mapBatchToConstructionItems,
  mapBatchToWorkItemDisplay,

  // Aggregation functions
  aggregateByCategory,
  aggregateByDepartment,
  aggregateByCollection,
  buildHierarchyTree,
  summarizeByResourceType,

  // Statistical functions
  calculateTotalCost,
  calculatePriceStats,

  // Filter utilities
  extractFilterOptions,
  filterWorkItems,

  // Conversion utilities
  toCostDonutData,
  createRateCodeLookup,
} from './workitem-mapper';

// Re-export types for convenience
export type {
  DDCWorkItem,
  WorkItemDisplay,
  CategoryAggregate,
  HierarchyAggregate,
  ResourceSummary,
  DDCFilterOptions,
  DDCFilterState,
} from '@/types/workitem';
