/**
 * OpenConstructionEstimate - DDC CWICR Work Item Types
 *
 * Full type definitions for the 85-column DDC CWICR dataset.
 * These types enable type-safe data handling for construction
 * cost estimates from Parquet data sources.
 *
 * @module types/workitem
 */

/* ============================================
   DDC CWICR FULL SCHEMA - 85 COLUMNS
   ============================================ */

/**
 * DDCWorkItem - Complete DDC CWICR Work Item Interface
 *
 * Represents a single row from the DDC CWICR dataset with all 85 columns
 * organized by logical groupings: Hierarchy, Rate/Work Item, Resources,
 * Labor, Machinery, Pricing, and Mass.
 */
export interface DDCWorkItem {
  /* ----------------------------------------
     HIERARCHY (10 columns)
     Classification and organizational data
     ---------------------------------------- */

  /** Primary type classification (e.g., 'MATERIAL', 'LABOR', 'EQUIPMENT') */
  category_type: string;

  /** Collection identifier code */
  collection_code: string;

  /** Human-readable collection name */
  collection_name: string;

  /** Department identifier code */
  department_code: string;

  /** Human-readable department name */
  department_name: string;

  /** Section name within department */
  section_name: string;

  /** Subsection identifier code */
  subsection_code: string;

  /** Human-readable subsection name */
  subsection_name: string;

  /** Division code (optional higher-level grouping) */
  division_code?: string;

  /** Division name (optional higher-level grouping) */
  division_name?: string;

  /* ----------------------------------------
     RATE / WORK ITEM (11 columns)
     Item identification and classification flags
     ---------------------------------------- */

  /** Unique rate/item code identifier */
  rate_code: string;

  /** Original name/description from source data */
  rate_original_name: string;

  /** Unit of measurement for the rate (e.g., 'm2', 'kg', 'hr') */
  rate_unit: string;

  /** Row type indicator (e.g., 'RATE', 'RESOURCE', 'COMPOSITE') */
  row_type: string;

  /** Flag indicating if item is a material */
  is_material: boolean;

  /** Flag indicating if item is labor-related */
  is_labor: boolean;

  /** Flag indicating if item is machinery/equipment */
  is_machine: boolean;

  /** Flag indicating if item is abstract/computed */
  is_abstract: boolean;

  /** Short code identifier */
  short_code?: string;

  /** Alternative description */
  alt_description?: string;

  /** Item status (active/deprecated) */
  status?: string;

  /* ----------------------------------------
     RESOURCES (7 columns)
     Individual resource details within work items
     ---------------------------------------- */

  /** Resource identifier code (null if not a resource row) */
  resource_code: string | null;

  /** Resource name/description */
  resource_name: string | null;

  /** Resource unit of measurement */
  resource_unit: string | null;

  /** Quantity of resource required */
  resource_quantity: number | null;

  /** Price per unit of resource */
  resource_price_per_unit: number | null;

  /** Total cost of resource (quantity * price) */
  resource_cost: number | null;

  /** Resource type classification */
  resource_type?: string | null;

  /* ----------------------------------------
     LABOR (11 columns)
     Workforce requirements and labor costs
     ---------------------------------------- */

  /** Number of general workers required */
  count_workers: number;

  /** Number of engineers required */
  count_engineers: number;

  /** Number of machine operators/machinists required */
  count_machinists: number;

  /** Labor hours per worker */
  labor_hours_worker: number;

  /** Labor hours per engineer */
  labor_hours_engineer: number;

  /** Labor hours per machinist */
  labor_hours_machinist: number;

  /** Total cost of working hours */
  cost_of_working_hours: number;

  /** Worker hourly rate */
  hourly_rate_worker?: number;

  /** Engineer hourly rate */
  hourly_rate_engineer?: number;

  /** Machinist hourly rate */
  hourly_rate_machinist?: number;

  /** Total labor cost */
  total_labor_cost?: number;

  /* ----------------------------------------
     MACHINERY (12 columns)
     Equipment and machinery specifications
     ---------------------------------------- */

  /** Classification of machine/equipment */
  machine_class: string | null;

  /** Grade/level of machinist personnel required */
  personnel_machinist_grade: number | null;

  /** Electricity consumption in kWh */
  electricity_consumption_kwh: number | null;

  /** Cost of electricity consumed */
  electricity_cost: number | null;

  /** Machine model identifier */
  machine_model?: string | null;

  /** Machine capacity/power rating */
  machine_capacity?: number | null;

  /** Machine capacity unit */
  machine_capacity_unit?: string | null;

  /** Fuel consumption rate */
  fuel_consumption?: number | null;

  /** Fuel cost */
  fuel_cost?: number | null;

  /** Machine hourly rental/operating cost */
  machine_hourly_cost?: number | null;

  /** Machine depreciation cost */
  machine_depreciation?: number | null;

  /** Total machinery cost */
  total_machine_cost?: number | null;

  /* ----------------------------------------
     PRICING (16 columns)
     Price estimates and statistical data
     ---------------------------------------- */

  /** Minimum estimated price */
  price_est_min: number;

  /** Maximum estimated price */
  price_est_max: number;

  /** Median estimated price */
  price_est_median: number;

  /** Mean/average estimated price */
  price_est_mean: number;

  /** Count of positions/entries in estimate */
  position_count: number;

  /** Technical group classification */
  tech_group: string | null;

  /** Standard deviation of price estimates */
  price_std_dev?: number;

  /** Price variance */
  price_variance?: number;

  /** 25th percentile price */
  price_p25?: number;

  /** 75th percentile price */
  price_p75?: number;

  /** Confidence level of estimate */
  confidence_level?: number;

  /** Price source reference */
  price_source?: string | null;

  /** Date of price estimate */
  price_date?: string | null;

  /** Currency code */
  currency?: string;

  /** Regional price factor */
  regional_factor?: number;

  /** Inflation adjustment factor */
  inflation_factor?: number;

  /* ----------------------------------------
     MASS (3 columns)
     Physical mass/weight data
     ---------------------------------------- */

  /** Name/description of mass property */
  mass_name: string | null;

  /** Numerical mass value */
  mass_value: number | null;

  /** Unit of mass measurement (e.g., 'kg', 'ton') */
  mass_unit: string | null;
}

/* ============================================
   SIMPLIFIED DISPLAY TYPES
   ============================================ */

/**
 * WorkItemDisplay - Simplified view for DataTable display
 *
 * Contains essential fields for table rendering plus extended
 * metadata fields for filtering and categorization.
 */
export interface WorkItemDisplay {
  /** Unique identifier */
  id: string;

  /** Item description */
  descripcion: string;

  /** Unit cost in currency */
  costoUnitario: number;

  /** Quantity */
  cantidad: number;

  /** Unit of measurement */
  unidad: string;

  /** Computed subtotal */
  subtotal: number;

  /** Category for grouping */
  categoria: string;

  /* Extended fields from DDC CWICR */

  /** Original rate code */
  rateCode: string;

  /** Category type classification */
  categoryType: string;

  /** Material flag */
  isMaterial: boolean;

  /** Labor flag */
  isLabor: boolean;

  /** Machine/equipment flag */
  isMachine: boolean;

  /** Minimum price estimate */
  priceMin: number;

  /** Maximum price estimate */
  priceMax: number;

  /** Collection name for breadcrumb navigation */
  collectionName?: string;

  /** Department name for breadcrumb navigation */
  departmentName?: string;

  /** Section name for breadcrumb navigation */
  sectionName?: string;
}

/* ============================================
   AGGREGATION TYPES
   ============================================ */

/**
 * CategoryAggregate - Aggregated cost by category
 *
 * Used for pie/donut chart visualization of cost distribution.
 */
export interface CategoryAggregate {
  /** Category name */
  name: string;

  /** Total cost value */
  value: number;

  /** Number of items in category */
  count?: number;

  /** Percentage of total */
  percentage?: number;
}

/**
 * HierarchyAggregate - Aggregated data by hierarchy level
 *
 * Used for drill-down navigation and tree views.
 */
export interface HierarchyAggregate {
  /** Hierarchy level (collection, department, section, etc.) */
  level: 'collection' | 'department' | 'section' | 'subsection';

  /** Code identifier */
  code: string;

  /** Display name */
  name: string;

  /** Total cost */
  totalCost: number;

  /** Number of items */
  itemCount: number;

  /** Child aggregates (for tree structure) */
  children?: HierarchyAggregate[];
}

/**
 * ResourceSummary - Summary of resources by type
 */
export interface ResourceSummary {
  /** Resource type (material, labor, machine) */
  type: 'material' | 'labor' | 'machine' | 'other';

  /** Total cost */
  totalCost: number;

  /** Number of resources */
  count: number;

  /** Average cost per resource */
  averageCost: number;
}

/* ============================================
   FILTER TYPES FOR DDC DATA
   ============================================ */

/**
 * DDCFilterOptions - Available filter options for DDC data
 */
export interface DDCFilterOptions {
  /** Available category types */
  categoryTypes: string[];

  /** Available collections */
  collections: Array<{ code: string; name: string }>;

  /** Available departments */
  departments: Array<{ code: string; name: string }>;

  /** Price range bounds */
  priceRange: { min: number; max: number };

  /** Available row types */
  rowTypes: string[];
}

/**
 * DDCFilterState - Current filter selections
 */
export interface DDCFilterState {
  /** Selected category types */
  categoryTypes: string[];

  /** Selected collection codes */
  collectionCodes: string[];

  /** Selected department codes */
  departmentCodes: string[];

  /** Price range filter */
  priceRange: { min?: number; max?: number };

  /** Material filter */
  isMaterial?: boolean;

  /** Labor filter */
  isLabor?: boolean;

  /** Machine filter */
  isMachine?: boolean;

  /** Text search query */
  searchQuery: string;
}

/* ============================================
   TYPE GUARDS
   ============================================ */

/**
 * Type guard to check if an object is a DDCWorkItem
 */
export function isDDCWorkItem(obj: unknown): obj is DDCWorkItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'rate_code' in obj &&
    'rate_original_name' in obj &&
    'category_type' in obj
  );
}

/**
 * Type guard to check if an object is a WorkItemDisplay
 */
export function isWorkItemDisplay(obj: unknown): obj is WorkItemDisplay {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'descripcion' in obj &&
    'rateCode' in obj &&
    'categoryType' in obj
  );
}

/* ============================================
   UTILITY TYPES
   ============================================ */

/**
 * Partial DDCWorkItem for incremental updates
 */
export type DDCWorkItemPartial = Partial<DDCWorkItem> & Pick<DDCWorkItem, 'rate_code'>;

/**
 * Keys of numeric fields in DDCWorkItem
 */
export type DDCNumericKey = {
  [K in keyof DDCWorkItem]: DDCWorkItem[K] extends number | null ? K : never;
}[keyof DDCWorkItem];

/**
 * Keys of string fields in DDCWorkItem
 */
export type DDCStringKey = {
  [K in keyof DDCWorkItem]: DDCWorkItem[K] extends string | null ? K : never;
}[keyof DDCWorkItem];

/**
 * Keys of boolean fields in DDCWorkItem
 */
export type DDCBooleanKey = {
  [K in keyof DDCWorkItem]: DDCWorkItem[K] extends boolean ? K : never;
}[keyof DDCWorkItem];

/* ============================================
   CONSTANTS
   ============================================ */

/**
 * Default values for DDCWorkItem numeric fields
 */
export const DDC_NUMERIC_DEFAULTS: Record<string, number> = {
  resource_quantity: 0,
  resource_price_per_unit: 0,
  resource_cost: 0,
  count_workers: 0,
  count_engineers: 0,
  count_machinists: 0,
  labor_hours_worker: 0,
  labor_hours_engineer: 0,
  labor_hours_machinist: 0,
  cost_of_working_hours: 0,
  price_est_min: 0,
  price_est_max: 0,
  price_est_median: 0,
  price_est_mean: 0,
  position_count: 0,
};

/**
 * Column groups for UI organization
 */
export const DDC_COLUMN_GROUPS = {
  hierarchy: [
    'category_type',
    'collection_code',
    'collection_name',
    'department_code',
    'department_name',
    'section_name',
    'subsection_code',
    'subsection_name',
  ],
  rate: [
    'rate_code',
    'rate_original_name',
    'rate_unit',
    'row_type',
    'is_material',
    'is_labor',
    'is_machine',
    'is_abstract',
  ],
  resources: [
    'resource_code',
    'resource_name',
    'resource_unit',
    'resource_quantity',
    'resource_price_per_unit',
    'resource_cost',
  ],
  labor: [
    'count_workers',
    'count_engineers',
    'count_machinists',
    'labor_hours_worker',
    'labor_hours_engineer',
    'labor_hours_machinist',
    'cost_of_working_hours',
  ],
  machinery: [
    'machine_class',
    'personnel_machinist_grade',
    'electricity_consumption_kwh',
    'electricity_cost',
  ],
  pricing: [
    'price_est_min',
    'price_est_max',
    'price_est_median',
    'price_est_mean',
    'position_count',
    'tech_group',
  ],
  mass: ['mass_name', 'mass_value', 'mass_unit'],
} as const;

/**
 * Display labels for column fields
 */
export const DDC_COLUMN_LABELS: Record<string, string> = {
  category_type: 'Category Type',
  collection_code: 'Collection Code',
  collection_name: 'Collection',
  department_code: 'Department Code',
  department_name: 'Department',
  section_name: 'Section',
  subsection_code: 'Subsection Code',
  subsection_name: 'Subsection',
  rate_code: 'Rate Code',
  rate_original_name: 'Description',
  rate_unit: 'Unit',
  row_type: 'Row Type',
  is_material: 'Material',
  is_labor: 'Labor',
  is_machine: 'Machine',
  is_abstract: 'Abstract',
  resource_code: 'Resource Code',
  resource_name: 'Resource',
  resource_unit: 'Resource Unit',
  resource_quantity: 'Quantity',
  resource_price_per_unit: 'Unit Price',
  resource_cost: 'Resource Cost',
  count_workers: 'Workers',
  count_engineers: 'Engineers',
  count_machinists: 'Machinists',
  labor_hours_worker: 'Worker Hours',
  labor_hours_engineer: 'Engineer Hours',
  labor_hours_machinist: 'Machinist Hours',
  cost_of_working_hours: 'Labor Cost',
  machine_class: 'Machine Class',
  personnel_machinist_grade: 'Machinist Grade',
  electricity_consumption_kwh: 'Electricity (kWh)',
  electricity_cost: 'Electricity Cost',
  price_est_min: 'Min Price',
  price_est_max: 'Max Price',
  price_est_median: 'Median Price',
  price_est_mean: 'Mean Price',
  position_count: 'Position Count',
  tech_group: 'Tech Group',
  mass_name: 'Mass Name',
  mass_value: 'Mass Value',
  mass_unit: 'Mass Unit',
};
