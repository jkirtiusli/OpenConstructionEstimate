/**
 * API Route: GET /api/stats
 * Returns aggregated statistics for a region's construction cost data
 *
 * Query Parameters:
 * - region: Region key (default: es-barcelona)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStats, RegionStats } from '@/lib/db/parquet-reader';
import { DEFAULT_REGION, isValidRegion, RegionKey, getRegionConfig } from '@/lib/db/regions';

export const dynamic = 'force-dynamic';

export interface StatsApiResponse extends RegionStats {
  region: RegionKey;
  city: string;
  currency: string;
  success: boolean;
  error?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<StatsApiResponse | { success: false; error: string }>> {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate region
    const regionParam = searchParams.get('region') || DEFAULT_REGION;
    if (!isValidRegion(regionParam)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid region: ${regionParam}`,
        },
        { status: 400 }
      );
    }
    const region = regionParam as RegionKey;
    const regionConfig = getRegionConfig(region)!;

    console.log(`[API /stats] Query: region=${region}`);

    // Get statistics
    const stats = await getStats(region);

    return NextResponse.json({
      success: true,
      region,
      city: regionConfig.city,
      currency: regionConfig.currency,
      ...stats,
    });
  } catch (error) {
    console.error('[API /stats] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
