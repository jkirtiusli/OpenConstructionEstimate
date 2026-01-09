/**
 * API Route: GET /api/workitems
 * Query work items from Parquet files with pagination and filtering
 *
 * Query Parameters:
 * - region: Region key (default: es-barcelona)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 100, max: 500)
 * - search: Search term for name/code/resource
 * - category: Filter by category type
 * - sortBy: Sort column (rate_code, rate_original_name, resource_price_per_unit, category_type)
 * - sortOrder: Sort direction (asc, desc)
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryWorkItems, QueryResult } from '@/lib/db/parquet-reader';
import { DEFAULT_REGION, isValidRegion, RegionKey } from '@/lib/db/regions';

export const dynamic = 'force-dynamic';

export interface WorkItemsApiResponse extends QueryResult {
  region: RegionKey;
  success: boolean;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<WorkItemsApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate region
    const regionParam = searchParams.get('region') || DEFAULT_REGION;
    if (!isValidRegion(regionParam)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid region: ${regionParam}`,
          region: DEFAULT_REGION,
          items: [],
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 100,
        },
        { status: 400 }
      );
    }
    const region = regionParam as RegionKey;

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));

    // Parse filter parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Parse sort parameters
    const sortBy = searchParams.get('sortBy') || 'rate_code';
    const sortOrderParam = searchParams.get('sortOrder') || 'asc';
    const sortOrder = sortOrderParam === 'desc' ? 'desc' : 'asc';

    // Parse price range parameters
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;

    console.log(`[API /workitems] Query: region=${region}, page=${page}, limit=${limit}, search=${search}`);

    // Execute query
    const result = await queryWorkItems(region, {
      page,
      limit,
      search,
      category,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
    });

    return NextResponse.json({
      success: true,
      region,
      ...result,
    });
  } catch (error) {
    console.error('[API /workitems] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        region: DEFAULT_REGION,
        items: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 100,
      },
      { status: 500 }
    );
  }
}
