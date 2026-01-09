/**
 * API Route: GET /api/regions
 * Returns all available regions with their configurations
 */

import { NextResponse } from 'next/server';
import { REGIONS, RegionKey, getRegionKeys } from '@/lib/db/regions';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export interface RegionResponse {
  key: RegionKey;
  code: string;
  city: string;
  currency: string;
  locale: string;
}

export interface RegionsApiResponse {
  regions: RegionResponse[];
  total: number;
}

export async function GET(): Promise<NextResponse<RegionsApiResponse>> {
  try {
    const regionKeys = getRegionKeys();

    const regions: RegionResponse[] = regionKeys.map((key) => ({
      key,
      code: REGIONS[key].code,
      city: REGIONS[key].city,
      currency: REGIONS[key].currency,
      locale: REGIONS[key].locale,
    }));

    return NextResponse.json({
      regions,
      total: regions.length,
    });
  } catch (error) {
    console.error('[API /regions] Error:', error);
    return NextResponse.json(
      { regions: [], total: 0 },
      { status: 500 }
    );
  }
}
