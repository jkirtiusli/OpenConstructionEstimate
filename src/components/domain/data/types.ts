/**
 * OpenConstructionEstimate - Data Types
 *
 * Type definitions for construction cost management data.
 * These types are designed for high-performance data tables
 * handling 5000+ rows with type safety.
 */

import type { SortingState, ColumnDef, VisibilityState } from "@tanstack/react-table";

/* ============================================
   CORE DATA TYPES
   ============================================ */

/**
 * ConstructionItem - Primary data model for line items
 *
 * Represents a single construction material, labor, or service
 * with pricing and quantity information.
 */
export interface ConstructionItem {
  /** Unique identifier for the item */
  id: string;

  /** Human-readable description of the line item */
  descripcion: string;

  /** Unit cost in USD */
  costoUnitario: number;

  /** Quantity of units */
  cantidad: number;

  /** Unit of measurement (e.g., m2, kg, unit, hr) */
  unidad: string;

  /** Computed subtotal: costoUnitario * cantidad */
  subtotal: number;

  /** Optional image URL for the material */
  imagenUrl?: string;

  /** Optional category for grouping */
  categoria?: string;

  /** Optional notes or additional description */
  notas?: string;
}

/**
 * ConstructionItemInput - Input type for creating items
 * Subtotal is computed, so it's omitted from input
 */
export type ConstructionItemInput = Omit<ConstructionItem, "subtotal">;

/* ============================================
   VIEW MODE TYPES
   ============================================ */

/**
 * ViewMode - Available display modes for the data interface
 * - 'table': Dense audit-style table with virtualization
 * - 'grid': Visual gallery view with image cards
 */
export type ViewMode = "table" | "grid";

/* ============================================
   TABLE COLUMN TYPES
   ============================================ */

/**
 * TableColumn - Generic column definition extending TanStack Table
 */
export type TableColumn<T> = ColumnDef<T, unknown>;

/**
 * ConstructionTableColumn - Specialized column for construction items
 */
export type ConstructionTableColumn = TableColumn<ConstructionItem>;

/**
 * ColumnKey - Valid column identifiers for ConstructionItem
 */
export type ColumnKey = keyof ConstructionItem;

/**
 * Default visible columns for the table view
 */
export const DEFAULT_VISIBLE_COLUMNS: ColumnKey[] = [
  "id",
  "descripcion",
  "costoUnitario",
  "cantidad",
  "unidad",
  "subtotal",
];

/* ============================================
   FILTER TYPES
   ============================================ */

/**
 * FilterOperator - Comparison operators for filtering
 */
export type FilterOperator =
  | "equals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between";

/**
 * FilterCondition - Single filter condition
 */
export interface FilterCondition {
  column: ColumnKey;
  operator: FilterOperator;
  value: string | number;
  secondValue?: number; // For 'between' operator
}

/**
 * TableFilters - Collection of active filters
 */
export interface TableFilters {
  globalSearch: string;
  conditions: FilterCondition[];
}

/**
 * Default empty filter state
 */
export const DEFAULT_FILTERS: TableFilters = {
  globalSearch: "",
  conditions: [],
};

/* ============================================
   STORE STATE TYPES
   ============================================ */

/**
 * TableState - Persisted table configuration
 */
export interface TableState {
  viewMode: ViewMode;
  filters: TableFilters;
  visibleColumns: ColumnKey[];
  sorting: SortingState;
  columnVisibility: VisibilityState;
  columnSizing: Record<string, number>;
}

/**
 * TableActions - Actions for modifying table state
 */
export interface TableActions {
  setViewMode: (mode: ViewMode) => void;
  setFilters: (filters: TableFilters) => void;
  setGlobalSearch: (search: string) => void;
  addFilterCondition: (condition: FilterCondition) => void;
  removeFilterCondition: (index: number) => void;
  clearFilters: () => void;
  setVisibleColumns: (columns: ColumnKey[]) => void;
  toggleColumn: (column: ColumnKey) => void;
  setSorting: (sorting: SortingState) => void;
  setColumnVisibility: (visibility: VisibilityState) => void;
  setColumnSizing: (sizing: Record<string, number>) => void;
  reset: () => void;
}

/**
 * TableStore - Complete store type
 */
export type TableStore = TableState & TableActions;

/* ============================================
   COMPONENT PROP TYPES
   ============================================ */

/**
 * DataTableProps - Props for the DataTable component
 */
export interface DataTableProps {
  /** Data array to display */
  data: ConstructionItem[];

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Callback when a row is clicked */
  onRowClick?: (item: ConstructionItem) => void;

  /** Callback when a row is double-clicked (for editing) */
  onRowDoubleClick?: (item: ConstructionItem) => void;

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;

  /** Custom row height (default: 48) */
  rowHeight?: number;

  /** Number of rows to render outside visible area (default: 5) */
  overscan?: number;

  /** Enable row selection */
  enableSelection?: boolean;

  /** Enable column resizing */
  enableResizing?: boolean;

  /** Enable sorting */
  enableSorting?: boolean;

  /** Custom class name */
  className?: string;
}

/**
 * EstimateGridProps - Props for the EstimateGrid component
 */
export interface EstimateGridProps {
  /** Data array to display */
  data: ConstructionItem[];

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Callback when a card is clicked */
  onCardClick?: (item: ConstructionItem) => void;

  /** Custom class name */
  className?: string;

  /** Minimum card width in pixels (default: 280) */
  minCardWidth?: number;

  /** Maximum card width in pixels (default: 400) */
  maxCardWidth?: number;
}

/* ============================================
   UTILITY TYPES
   ============================================ */

/**
 * Creates a ConstructionItem with computed subtotal
 */
export function createConstructionItem(
  input: ConstructionItemInput
): ConstructionItem {
  return {
    ...input,
    subtotal: input.costoUnitario * input.cantidad,
  };
}

/**
 * Type guard to check if an object is a ConstructionItem
 */
export function isConstructionItem(obj: unknown): obj is ConstructionItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "descripcion" in obj &&
    "costoUnitario" in obj &&
    "cantidad" in obj &&
    "unidad" in obj &&
    "subtotal" in obj
  );
}
