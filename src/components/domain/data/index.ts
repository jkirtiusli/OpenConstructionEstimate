/**
 * OpenConstructionEstimate - Data Components
 *
 * Barrel export for data visualization components.
 * Import from '@/components/domain/data' for clean imports.
 */

// Components
export { DataTable } from "./DataTable";
export { EstimateGrid } from "./EstimateGrid";
export { DataViewDemo } from "./DataViewDemo";

// Types
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
} from "./types";

// Utilities
export {
  createConstructionItem,
  isConstructionItem,
  DEFAULT_VISIBLE_COLUMNS,
  DEFAULT_FILTERS,
} from "./types";

// Mock data for development/testing
export { MOCK_CONSTRUCTION_ITEMS, generateMockItems } from "./mockData";
