/**
 * OpenConstructionEstimate - Types Index
 *
 * Central export point for all type definitions.
 *
 * @module types
 */

// DDC CWICR Work Item Types
export type {
  DDCWorkItem,
  WorkItemDisplay,
  CategoryAggregate,
  HierarchyAggregate,
  ResourceSummary,
  DDCFilterOptions,
  DDCFilterState,
  DDCWorkItemPartial,
  DDCNumericKey,
  DDCStringKey,
  DDCBooleanKey,
} from './workitem';

// Type guards
export { isDDCWorkItem, isWorkItemDisplay } from './workitem';

// Constants
export {
  DDC_NUMERIC_DEFAULTS,
  DDC_COLUMN_GROUPS,
  DDC_COLUMN_LABELS,
} from './workitem';

// Re-export domain types for convenience
export type {
  ConstructionItem,
  ConstructionItemInput,
  ViewMode,
  TableColumn,
  ConstructionTableColumn,
  ColumnKey,
  FilterOperator,
  FilterCondition,
  TableFilters,
  TableState,
  TableActions,
  TableStore,
  DataTableProps,
  EstimateGridProps,
} from '@/components/domain/data/types';

export {
  DEFAULT_VISIBLE_COLUMNS,
  DEFAULT_FILTERS,
  createConstructionItem,
  isConstructionItem,
} from '@/components/domain/data/types';
