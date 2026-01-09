/**
 * OpenConstructionEstimate - Work Item Mappers
 *
 * Transforms DDC CWICR data rows to application-specific formats.
 * Handles null coalescing, field mapping, and aggregation logic.
 *
 * @module lib/mappers/workitem-mapper
 */

import type { DDCWorkItem, WorkItemDisplay, CategoryAggregate, HierarchyAggregate, ResourceSummary } from '@/types/workitem';
import type { ConstructionItem } from '@/components/domain/data/types';

/* ============================================
   PRIMARY MAPPERS
   ============================================ */

/**
 * Maps a DDC CWICR row to ConstructionItem for DataTable display
 *
 * This is the primary transformation used for the main data table.
 * It extracts the most relevant fields for display while computing
 * the subtotal from available pricing data.
 *
 * @param row - Raw DDC CWICR work item data
 * @param index - Row index for fallback ID generation
 * @returns ConstructionItem compatible with DataTable
 */
export function mapToConstructionItem(row: DDCWorkItem, index: number): ConstructionItem {
  // Determine the best available price
  const unitPrice = row.resource_price_per_unit ?? row.price_est_median ?? row.price_est_mean ?? 0;

  // Determine quantity (default to 1 if not available)
  const quantity = row.resource_quantity ?? 1;

  // Calculate subtotal from resource cost or compute from price * quantity
  const subtotal = row.resource_cost ?? unitPrice * quantity;

  return {
    id: row.rate_code || `ITEM-${index.toString().padStart(5, '0')}`,
    descripcion: row.rate_original_name || row.resource_name || 'Unknown Item',
    costoUnitario: unitPrice,
    cantidad: quantity,
    unidad: row.rate_unit || row.resource_unit || 'unit',
    subtotal,
    categoria: row.category_type || row.department_name || undefined,
  };
}

/**
 * Maps a DDC CWICR row to extended WorkItemDisplay format
 *
 * Includes additional metadata fields for advanced filtering,
 * categorization, and drill-down navigation.
 *
 * @param row - Raw DDC CWICR work item data
 * @param index - Row index for fallback ID generation
 * @returns WorkItemDisplay with extended fields
 */
export function mapToWorkItemDisplay(row: DDCWorkItem, index: number): WorkItemDisplay {
  const base = mapToConstructionItem(row, index);

  return {
    ...base,
    categoria: base.categoria || 'Uncategorized',
    rateCode: row.rate_code,
    categoryType: row.category_type,
    isMaterial: row.is_material,
    isLabor: row.is_labor,
    isMachine: row.is_machine,
    priceMin: row.price_est_min,
    priceMax: row.price_est_max,
    collectionName: row.collection_name || undefined,
    departmentName: row.department_name || undefined,
    sectionName: row.section_name || undefined,
  };
}

/**
 * Batch maps DDC rows to ConstructionItems
 *
 * Optimized for large datasets with single-pass transformation.
 *
 * @param rows - Array of DDC work items
 * @returns Array of ConstructionItems
 */
export function mapBatchToConstructionItems(rows: DDCWorkItem[]): ConstructionItem[] {
  return rows.map((row, index) => mapToConstructionItem(row, index));
}

/**
 * Batch maps DDC rows to WorkItemDisplay
 *
 * @param rows - Array of DDC work items
 * @returns Array of WorkItemDisplay objects
 */
export function mapBatchToWorkItemDisplay(rows: DDCWorkItem[]): WorkItemDisplay[] {
  return rows.map((row, index) => mapToWorkItemDisplay(row, index));
}

/* ============================================
   AGGREGATION FUNCTIONS
   ============================================ */

/**
 * Aggregates work items by category for CostDonut visualization
 *
 * Groups items by category_type and sums their costs.
 * Returns top N categories sorted by value descending.
 *
 * @param items - Array of DDC work items
 * @param topN - Maximum number of categories to return (default: 10)
 * @returns Array of CategoryAggregate for chart rendering
 */
export function aggregateByCategory(
  items: DDCWorkItem[],
  topN: number = 10
): CategoryAggregate[] {
  const categoryMap = new Map<string, { value: number; count: number }>();

  for (const item of items) {
    const category = item.category_type || 'Other';
    const cost = item.resource_cost ?? item.price_est_median ?? item.price_est_mean ?? 0;

    const existing = categoryMap.get(category) ?? { value: 0, count: 0 };
    categoryMap.set(category, {
      value: existing.value + cost,
      count: existing.count + 1,
    });
  }

  // Calculate total for percentages
  const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.value, 0);

  // Convert to array, add percentages, sort, and limit
  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
      percentage: total > 0 ? (data.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
}

/**
 * Aggregates work items by department
 *
 * @param items - Array of DDC work items
 * @returns Array of CategoryAggregate by department
 */
export function aggregateByDepartment(items: DDCWorkItem[]): CategoryAggregate[] {
  const deptMap = new Map<string, { value: number; count: number }>();

  for (const item of items) {
    const dept = item.department_name || item.department_code || 'Unknown';
    const cost = item.resource_cost ?? item.price_est_median ?? 0;

    const existing = deptMap.get(dept) ?? { value: 0, count: 0 };
    deptMap.set(dept, {
      value: existing.value + cost,
      count: existing.count + 1,
    });
  }

  const total = Array.from(deptMap.values()).reduce((sum, d) => sum + d.value, 0);

  return Array.from(deptMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
      percentage: total > 0 ? (data.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Aggregates work items by collection
 *
 * @param items - Array of DDC work items
 * @returns Array of CategoryAggregate by collection
 */
export function aggregateByCollection(items: DDCWorkItem[]): CategoryAggregate[] {
  const collMap = new Map<string, { value: number; count: number }>();

  for (const item of items) {
    const collection = item.collection_name || item.collection_code || 'Unknown';
    const cost = item.resource_cost ?? item.price_est_median ?? 0;

    const existing = collMap.get(collection) ?? { value: 0, count: 0 };
    collMap.set(collection, {
      value: existing.value + cost,
      count: existing.count + 1,
    });
  }

  const total = Array.from(collMap.values()).reduce((sum, c) => sum + c.value, 0);

  return Array.from(collMap.entries())
    .map(([name, data]) => ({
      name,
      value: data.value,
      count: data.count,
      percentage: total > 0 ? (data.value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Creates a hierarchical aggregate structure for tree navigation
 *
 * Builds a nested structure: Collection -> Department -> Section -> Subsection
 *
 * @param items - Array of DDC work items
 * @returns Array of top-level HierarchyAggregate nodes
 */
export function buildHierarchyTree(items: DDCWorkItem[]): HierarchyAggregate[] {
  // Use nested maps for efficient grouping
  const collectionMap = new Map<string, {
    name: string;
    totalCost: number;
    itemCount: number;
    departments: Map<string, {
      name: string;
      totalCost: number;
      itemCount: number;
      sections: Map<string, {
        totalCost: number;
        itemCount: number;
      }>;
    }>;
  }>();

  for (const item of items) {
    const collCode = item.collection_code || 'UNKNOWN';
    const collName = item.collection_name || 'Unknown Collection';
    const deptCode = item.department_code || 'UNKNOWN';
    const deptName = item.department_name || 'Unknown Department';
    const sectionName = item.section_name || 'Unknown Section';
    const cost = item.resource_cost ?? item.price_est_median ?? 0;

    // Get or create collection
    if (!collectionMap.has(collCode)) {
      collectionMap.set(collCode, {
        name: collName,
        totalCost: 0,
        itemCount: 0,
        departments: new Map(),
      });
    }
    const collection = collectionMap.get(collCode)!;
    collection.totalCost += cost;
    collection.itemCount += 1;

    // Get or create department
    if (!collection.departments.has(deptCode)) {
      collection.departments.set(deptCode, {
        name: deptName,
        totalCost: 0,
        itemCount: 0,
        sections: new Map(),
      });
    }
    const department = collection.departments.get(deptCode)!;
    department.totalCost += cost;
    department.itemCount += 1;

    // Get or create section
    if (!department.sections.has(sectionName)) {
      department.sections.set(sectionName, {
        totalCost: 0,
        itemCount: 0,
      });
    }
    const section = department.sections.get(sectionName)!;
    section.totalCost += cost;
    section.itemCount += 1;
  }

  // Convert to HierarchyAggregate array
  return Array.from(collectionMap.entries()).map(([collCode, coll]) => ({
    level: 'collection' as const,
    code: collCode,
    name: coll.name,
    totalCost: coll.totalCost,
    itemCount: coll.itemCount,
    children: Array.from(coll.departments.entries()).map(([deptCode, dept]) => ({
      level: 'department' as const,
      code: deptCode,
      name: dept.name,
      totalCost: dept.totalCost,
      itemCount: dept.itemCount,
      children: Array.from(dept.sections.entries()).map(([sectName, sect]) => ({
        level: 'section' as const,
        code: sectName,
        name: sectName,
        totalCost: sect.totalCost,
        itemCount: sect.itemCount,
      })),
    })),
  }));
}

/**
 * Summarizes resources by type (material, labor, machine)
 *
 * @param items - Array of DDC work items
 * @returns Array of ResourceSummary by type
 */
export function summarizeByResourceType(items: DDCWorkItem[]): ResourceSummary[] {
  const summaries: Record<string, { totalCost: number; count: number }> = {
    material: { totalCost: 0, count: 0 },
    labor: { totalCost: 0, count: 0 },
    machine: { totalCost: 0, count: 0 },
    other: { totalCost: 0, count: 0 },
  };

  for (const item of items) {
    const cost = item.resource_cost ?? item.price_est_median ?? 0;

    if (item.is_material) {
      summaries.material.totalCost += cost;
      summaries.material.count += 1;
    } else if (item.is_labor) {
      summaries.labor.totalCost += cost;
      summaries.labor.count += 1;
    } else if (item.is_machine) {
      summaries.machine.totalCost += cost;
      summaries.machine.count += 1;
    } else {
      summaries.other.totalCost += cost;
      summaries.other.count += 1;
    }
  }

  return (Object.entries(summaries) as [ResourceSummary['type'], { totalCost: number; count: number }][])
    .filter(([, data]) => data.count > 0)
    .map(([type, data]) => ({
      type,
      totalCost: data.totalCost,
      count: data.count,
      averageCost: data.count > 0 ? data.totalCost / data.count : 0,
    }));
}

/* ============================================
   STATISTICAL FUNCTIONS
   ============================================ */

/**
 * Calculates total cost from an array of DDC work items
 *
 * @param items - Array of DDC work items
 * @returns Total cost
 */
export function calculateTotalCost(items: DDCWorkItem[]): number {
  return items.reduce((sum, item) => {
    const cost = item.resource_cost ?? item.price_est_median ?? item.price_est_mean ?? 0;
    return sum + cost;
  }, 0);
}

/**
 * Calculates price range statistics
 *
 * @param items - Array of DDC work items
 * @returns Object with min, max, mean, and median prices
 */
export function calculatePriceStats(items: DDCWorkItem[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  total: number;
  count: number;
} {
  if (items.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, total: 0, count: 0 };
  }

  const prices = items
    .map((item) => item.resource_cost ?? item.price_est_median ?? 0)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return { min: 0, max: 0, mean: 0, median: 0, total: 0, count: items.length };
  }

  const total = prices.reduce((sum, p) => sum + p, 0);
  const mean = total / prices.length;
  const median =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

  return {
    min: prices[0],
    max: prices[prices.length - 1],
    mean,
    median,
    total,
    count: items.length,
  };
}

/* ============================================
   FILTER UTILITIES
   ============================================ */

/**
 * Extracts unique filter options from DDC data
 *
 * @param items - Array of DDC work items
 * @returns DDCFilterOptions with available filter values
 */
export function extractFilterOptions(items: DDCWorkItem[]) {
  const categoryTypes = new Set<string>();
  const collections = new Map<string, string>();
  const departments = new Map<string, string>();
  const rowTypes = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  for (const item of items) {
    if (item.category_type) categoryTypes.add(item.category_type);
    if (item.collection_code) collections.set(item.collection_code, item.collection_name || item.collection_code);
    if (item.department_code) departments.set(item.department_code, item.department_name || item.department_code);
    if (item.row_type) rowTypes.add(item.row_type);

    const price = item.price_est_median ?? item.resource_price_per_unit ?? 0;
    if (price > 0) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
  }

  return {
    categoryTypes: Array.from(categoryTypes).sort(),
    collections: Array.from(collections.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    departments: Array.from(departments.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice === -Infinity ? 0 : maxPrice,
    },
    rowTypes: Array.from(rowTypes).sort(),
  };
}

/**
 * Filters DDC work items based on filter state
 *
 * @param items - Array of DDC work items
 * @param filters - Filter state to apply
 * @returns Filtered array of DDC work items
 */
export function filterWorkItems(
  items: DDCWorkItem[],
  filters: {
    categoryTypes?: string[];
    collectionCodes?: string[];
    departmentCodes?: string[];
    priceRange?: { min?: number; max?: number };
    isMaterial?: boolean;
    isLabor?: boolean;
    isMachine?: boolean;
    searchQuery?: string;
  }
): DDCWorkItem[] {
  return items.filter((item) => {
    // Category type filter
    if (filters.categoryTypes?.length && !filters.categoryTypes.includes(item.category_type)) {
      return false;
    }

    // Collection filter
    if (filters.collectionCodes?.length && !filters.collectionCodes.includes(item.collection_code)) {
      return false;
    }

    // Department filter
    if (filters.departmentCodes?.length && !filters.departmentCodes.includes(item.department_code)) {
      return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const price = item.price_est_median ?? item.resource_price_per_unit ?? 0;
      if (filters.priceRange.min !== undefined && price < filters.priceRange.min) return false;
      if (filters.priceRange.max !== undefined && price > filters.priceRange.max) return false;
    }

    // Type flags
    if (filters.isMaterial !== undefined && item.is_material !== filters.isMaterial) return false;
    if (filters.isLabor !== undefined && item.is_labor !== filters.isLabor) return false;
    if (filters.isMachine !== undefined && item.is_machine !== filters.isMachine) return false;

    // Text search
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchFields = [
        item.rate_code,
        item.rate_original_name,
        item.resource_name,
        item.category_type,
        item.department_name,
        item.collection_name,
      ].filter(Boolean);

      if (!searchFields.some((field) => field?.toLowerCase().includes(query))) {
        return false;
      }
    }

    return true;
  });
}

/* ============================================
   CONVERSION UTILITIES
   ============================================ */

/**
 * Converts CategoryAggregate to CostDonut-compatible format
 *
 * @param aggregates - Array of CategoryAggregate
 * @returns Array suitable for CostDonut component
 */
export function toCostDonutData(
  aggregates: CategoryAggregate[]
): Array<{ id: string; name: string; value: number }> {
  return aggregates.map((agg, index) => ({
    id: `cat-${index}`,
    name: agg.name,
    value: agg.value,
  }));
}

/**
 * Creates a lookup map for fast item retrieval by rate code
 *
 * @param items - Array of DDC work items
 * @returns Map with rate_code as key
 */
export function createRateCodeLookup(items: DDCWorkItem[]): Map<string, DDCWorkItem> {
  const map = new Map<string, DDCWorkItem>();
  for (const item of items) {
    if (item.rate_code) {
      map.set(item.rate_code, item);
    }
  }
  return map;
}
