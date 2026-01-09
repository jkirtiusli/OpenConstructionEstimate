/**
 * Parquet Reader using parquetjs
 * Optimized for server-side rendering in Next.js with caching
 *
 * Uses parquetjs for pure JavaScript Parquet file reading
 * which is fully compatible with Node.js and Next.js
 */

import path from 'path';
import fs from 'fs';
import { RegionKey, getRegionConfig } from './regions';

// Dynamic import for @dsnp/parquetjs (maintained fork with modern Parquet support)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const parquet = require('@dsnp/parquetjs');

// Types for work items and query options
export interface WorkItem {
  id: string;
  rate_code: string;
  rate_original_name: string;
  rate_name_english: string;
  rate_unit: string;
  resource_price_per_unit: number;
  category_type: string;
  subcategory: string;
  resource_type: string;
  resource_name: string;
  resource_unit: string;
  resource_quantity: number;
  [key: string]: unknown;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface QueryResult {
  items: WorkItem[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface RegionStats {
  totalItems: number;
  totalCost: number;
  avgCost: number;
  minCost: number;
  maxCost: number;
  byCategory: { category: string; count: number; totalCost: number }[];
  byCostRange: { range: string; count: number }[];
}

// Cache for loaded Parquet data
interface CachedData {
  rows: Record<string, unknown>[];
  columns: string[];
  timestamp: number;
}

const dataCache = new Map<string, CachedData>();
const queryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes for data cache
const QUERY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for query results

/**
 * Load and parse Parquet file for a region
 */
async function loadParquetData(region: RegionKey): Promise<CachedData> {
  const cacheKey = `data:${region}`;
  const cached = dataCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Parquet] Cache hit for ${region}`);
    return cached;
  }

  const config = getRegionConfig(region);
  if (!config) {
    throw new Error(`Invalid region: ${region}`);
  }

  const filePath = path.join(process.cwd(), config.file);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Parquet file not found: ${filePath}`);
  }

  console.log(`[Parquet] Loading file: ${filePath}`);
  const startTime = Date.now();

  // Open and read the Parquet file
  const reader = await parquet.ParquetReader.openFile(filePath);
  const cursor = reader.getCursor();

  // Get column names from schema
  const schema = reader.getSchema();
  const columns: string[] = Object.keys(schema.fields || {});

  // Read all rows
  const rows: Record<string, unknown>[] = [];
  let record: Record<string, unknown> | null = null;

  while ((record = await cursor.next())) {
    rows.push({ ...record });
  }

  await reader.close();

  const loadTime = Date.now() - startTime;
  console.log(`[Parquet] Loaded ${rows.length} rows in ${loadTime}ms`);

  const data: CachedData = {
    rows,
    columns,
    timestamp: Date.now(),
  };

  dataCache.set(cacheKey, data);
  return data;
}

/**
 * Get cached query result or null if expired/missing
 */
function getCachedResult<T>(key: string): T | null {
  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp < QUERY_CACHE_TTL) {
    return cached.data as T;
  }
  queryCache.delete(key);
  return null;
}

/**
 * Set cache result
 */
function setCachedResult(key: string, data: unknown): void {
  queryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Safe string accessor
 */
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/**
 * Safe number accessor
 */
function safeNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

/**
 * Query work items with pagination and filtering
 */
export async function queryWorkItems(
  region: RegionKey,
  options: QueryOptions = {}
): Promise<QueryResult> {
  const {
    page = 1,
    limit = 100,
    search = '',
    category = '',
    sortBy = 'rate_code',
    sortOrder = 'asc',
    minPrice,
    maxPrice,
  } = options;

  // Generate cache key
  const cacheKey = `workitems:${region}:${JSON.stringify(options)}`;
  const cached = getCachedResult<QueryResult>(cacheKey);
  if (cached) {
    console.log(`[Parquet] Query cache hit: ${cacheKey}`);
    return cached;
  }

  const data = await loadParquetData(region);
  let filteredRows = data.rows;

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRows = filteredRows.filter((row) => {
      const rateName = safeString(row.rate_original_name).toLowerCase();
      const rateCode = safeString(row.rate_code).toLowerCase();
      const resourceName = safeString(row.resource_name).toLowerCase();
      return (
        rateName.includes(searchLower) ||
        rateCode.includes(searchLower) ||
        resourceName.includes(searchLower)
      );
    });
  }

  if (category) {
    filteredRows = filteredRows.filter(
      (row) => safeString(row.category_type) === category
    );
  }

  if (minPrice !== undefined) {
    filteredRows = filteredRows.filter(
      (row) => safeNumber(row.resource_price_per_unit) >= minPrice
    );
  }

  if (maxPrice !== undefined) {
    filteredRows = filteredRows.filter(
      (row) => safeNumber(row.resource_price_per_unit) <= maxPrice
    );
  }

  // Get total before pagination
  const total = filteredRows.length;

  // Apply sorting
  const validSortColumns = [
    'rate_code',
    'rate_original_name',
    'resource_price_per_unit',
    'category_type',
  ];
  const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'rate_code';

  filteredRows = [...filteredRows].sort((a, b) => {
    const aVal = a[safeSort];
    const bVal = b[safeSort];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = safeString(aVal);
    const bStr = safeString(bVal);
    return sortOrder === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedRows = filteredRows.slice(offset, offset + limit);
  const totalPages = Math.ceil(total / limit);

  // Map to WorkItem type
  const items: WorkItem[] = paginatedRows.map((row, index) => ({
    id: String(offset + index + 1),
    rate_code: safeString(row.rate_code),
    rate_original_name: safeString(row.rate_original_name),
    rate_name_english: safeString(row.rate_name_english),
    rate_unit: safeString(row.rate_unit),
    resource_price_per_unit: safeNumber(row.resource_price_per_unit),
    category_type: safeString(row.category_type),
    subcategory: safeString(row.subcategory),
    resource_type: safeString(row.resource_type),
    resource_name: safeString(row.resource_name),
    resource_unit: safeString(row.resource_unit),
    resource_quantity: safeNumber(row.resource_quantity),
  }));

  const response: QueryResult = {
    items,
    total,
    page,
    totalPages,
    limit,
  };

  setCachedResult(cacheKey, response);
  return response;
}

/**
 * Get statistics for a region
 */
export async function getStats(region: RegionKey): Promise<RegionStats> {
  const cacheKey = `stats:${region}`;
  const cached = getCachedResult<RegionStats>(cacheKey);
  if (cached) {
    console.log(`[Parquet] Stats cache hit: ${cacheKey}`);
    return cached;
  }

  const data = await loadParquetData(region);
  const rows = data.rows;

  // Calculate aggregate statistics
  let totalCost = 0;
  let minCost = Infinity;
  let maxCost = -Infinity;

  for (const row of rows) {
    const price = safeNumber(row.resource_price_per_unit);
    totalCost += price;
    if (price < minCost) minCost = price;
    if (price > maxCost) maxCost = price;
  }

  const totalItems = rows.length;
  const avgCost = totalItems > 0 ? totalCost / totalItems : 0;

  // Handle edge case of no data
  if (minCost === Infinity) minCost = 0;
  if (maxCost === -Infinity) maxCost = 0;

  // Calculate statistics by category
  const categoryMap = new Map<string, { count: number; totalCost: number }>();
  for (const row of rows) {
    const category = safeString(row.category_type) || 'Unknown';
    const price = safeNumber(row.resource_price_per_unit);
    const existing = categoryMap.get(category) || { count: 0, totalCost: 0 };
    categoryMap.set(category, {
      count: existing.count + 1,
      totalCost: existing.totalCost + price,
    });
  }

  const byCategory = Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      totalCost: stats.totalCost,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Calculate statistics by cost range
  const ranges = [
    { name: '0-10', min: 0, max: 10 },
    { name: '10-50', min: 10, max: 50 },
    { name: '50-100', min: 50, max: 100 },
    { name: '100-500', min: 100, max: 500 },
    { name: '500-1000', min: 500, max: 1000 },
    { name: '1000+', min: 1000, max: Infinity },
  ];

  const rangeCounts = new Map<string, number>();
  for (const range of ranges) {
    rangeCounts.set(range.name, 0);
  }

  for (const row of rows) {
    const price = safeNumber(row.resource_price_per_unit);
    for (const range of ranges) {
      if (price >= range.min && price < range.max) {
        rangeCounts.set(range.name, (rangeCounts.get(range.name) || 0) + 1);
        break;
      }
    }
  }

  const byCostRange = ranges.map((range) => ({
    range: range.name,
    count: rangeCounts.get(range.name) || 0,
  }));

  const response: RegionStats = {
    totalItems,
    totalCost,
    avgCost,
    minCost,
    maxCost,
    byCategory,
    byCostRange,
  };

  setCachedResult(cacheKey, response);
  return response;
}

/**
 * Get available columns from a Parquet file
 */
export async function getColumns(region: RegionKey): Promise<string[]> {
  const cacheKey = `columns:${region}`;
  const cached = getCachedResult<string[]>(cacheKey);
  if (cached) return cached;

  const data = await loadParquetData(region);
  setCachedResult(cacheKey, data.columns);
  return data.columns;
}

/**
 * Clear the query cache
 */
export function clearCache(): void {
  queryCache.clear();
  dataCache.clear();
  console.log('[Parquet] Cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { dataCache: number; queryCache: number } {
  return {
    dataCache: dataCache.size,
    queryCache: queryCache.size,
  };
}
