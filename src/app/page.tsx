'use client';

import { useState, useCallback, useMemo } from 'react';
import { MainSidebar } from '@/components/layout/MainSidebar';
import { BIMViewer } from '@/components/domain/bim/BIMViewer';
import { DataTable } from '@/components/domain/data/DataTable';
import { CostDonut } from '@/components/domain/charts/CostDonut';
import {
  TrendSparklineWithLabel,
  sampleCostTrend,
} from '@/components/domain/charts/TrendSparkline';
import { MOCK_CONSTRUCTION_ITEMS } from '@/components/domain/data/mockData';
import { useWorkItems, useCostStats } from '@/hooks';
import { useRegionStore } from '@/lib/stores/regionStore';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { CostCategory } from '@/components/domain/charts/CostDonut';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

interface MetricCardProps {
  label: string;
  value: string;
  trend?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

/* ============================================
   METRIC CARD COMPONENT
   Small stat card for key metrics
   ============================================ */

function MetricCard({ label, value, trend, className, isLoading }: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-paper rounded-2xl shadow-soft-md p-4',
        'border border-border-soft',
        className
      )}
    >
      <p className="text-xs text-subtle uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between gap-4">
        {isLoading ? (
          <div className="skeleton h-7 w-24 rounded" />
        ) : (
          <p className="text-xl font-semibold text-carbon tabular-nums">{value}</p>
        )}
        {trend}
      </div>
    </div>
  );
}

/* ============================================
   BENTO CARD WRAPPER
   Consistent card styling for bento grid items
   ============================================ */

interface BentoCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

function BentoCard({ title, children, className, isLoading }: BentoCardProps) {
  return (
    <div
      className={cn(
        'bg-paper rounded-2xl shadow-soft-md overflow-hidden',
        'border border-border-soft',
        className
      )}
    >
      {title && (
        <div className="px-5 py-4 border-b border-border-muted">
          <h2 className="text-sm font-semibold text-carbon">{title}</h2>
        </div>
      )}
      {isLoading ? (
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="animate-pulse text-subtle">Loading...</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/* ============================================
   MAIN DASHBOARD PAGE
   Bento grid layout with sidebar
   ============================================ */

export default function DashboardPage() {
  const [activeRoute, setActiveRoute] = useState('/');
  const selectedRegion = useRegionStore((s) => s.selectedRegion);

  // Fetch work items from API
  const { data: workItemsData, isLoading: isLoadingItems, error: itemsError } = useWorkItems({
    limit: 100,
  });

  // Fetch cost statistics from API
  const { data: statsData, isLoading: isLoadingStats } = useCostStats();

  const handleNavigate = useCallback((route: string) => {
    setActiveRoute(route);
    console.log('Navigate to:', route);
  }, []);

  // Use real data if available, fallback to mock
  const displayItems = useMemo(() => {
    if (workItemsData?.data && workItemsData.data.length > 0) {
      // Map API response to ConstructionItem format
      return workItemsData.data.map((item) => ({
        id: item.id || item.code,
        descripcion: item.description,
        costoUnitario: item.unitCost,
        cantidad: 1,
        unidad: item.unit,
        subtotal: item.unitCost,
        categoria: item.category,
      }));
    }
    return MOCK_CONSTRUCTION_ITEMS;
  }, [workItemsData]);

  // Calculate totals from real data or mock
  const totalCost = useMemo(() => {
    // Use categoryBreakdown total if available
    if (statsData?.categoryBreakdown && statsData.categoryBreakdown.length > 0) {
      return statsData.categoryBreakdown.reduce((sum, cat) => sum + (cat.totalValue || 0), 0);
    }
    return displayItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }, [statsData, displayItems]);

  const totalItems = useMemo(() => {
    if (statsData?.overview?.totalWorkItems) {
      return statsData.overview.totalWorkItems;
    }
    return workItemsData?.pagination?.total || displayItems.length;
  }, [statsData, workItemsData, displayItems]);

  // Convert stats to CostDonut format
  const costBreakdownData: CostCategory[] = useMemo(() => {
    if (statsData?.categoryBreakdown && statsData.categoryBreakdown.length > 0) {
      return statsData.categoryBreakdown.slice(0, 8).map((cat, index) => ({
        id: `cat-${index}`,
        name: cat.category || 'Other',
        value: cat.totalValue || 0,
      }));
    }
    // Fallback to mock data categories
    return [
      { id: 'labor', name: 'Labor', value: 245000 },
      { id: 'materials', name: 'Materials', value: 189000 },
      { id: 'equipment', name: 'Equipment', value: 67000 },
      { id: 'subcontractors', name: 'Subcontractors', value: 123000 },
      { id: 'overhead', name: 'Overhead', value: 45000 },
    ];
  }, [statsData]);

  const categoryCount = useMemo(() => {
    if (statsData?.overview?.categoryCount) {
      return statsData.overview.categoryCount;
    }
    if (statsData?.categoryBreakdown) {
      return statsData.categoryBreakdown.length;
    }
    return 14;
  }, [statsData]);

  const isLoading = isLoadingItems || isLoadingStats;

  return (
    <div className="flex h-screen overflow-hidden bg-cloud">
      {/* Sidebar */}
      <MainSidebar activeRoute={activeRoute} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-3 pl-0">
        <div className="h-full flex gap-3">
          {/* Left Column - 60% - 3D Viewer */}
          <div className="w-[60%] flex flex-col gap-3">
            {/* 3D BIM Viewer - Main Visual */}
            <BentoCard className="flex-1 min-h-0">
              <div className="h-full p-1">
                <BIMViewer
                  height="100%"
                  className="h-full"
                  enableFloat={true}
                  autoRotate={false}
                />
              </div>
            </BentoCard>

            {/* Bottom Row - Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label="Total Budget"
                value={formatCurrency(totalCost, { compact: true })}
                isLoading={isLoading}
                trend={
                  <TrendSparklineWithLabel
                    data={sampleCostTrend}
                    width={80}
                    height={28}
                    showChange={false}
                  />
                }
              />
              <MetricCard
                label="Line Items"
                value={totalItems.toLocaleString()}
                isLoading={isLoading}
              />
              <MetricCard
                label="Categories"
                value={categoryCount.toString()}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Column - 40% - Data & Charts */}
          <div className="w-[40%] flex flex-col gap-3">
            {/* Cost Breakdown Donut */}
            <BentoCard title="Budget Breakdown" className="shrink-0" isLoading={isLoadingStats}>
              <div className="p-4">
                <CostDonut
                  data={costBreakdownData}
                  size={220}
                  showCenterTotal={true}
                  centerLabel="Total"
                />
              </div>
            </BentoCard>

            {/* Data Table */}
            <BentoCard title="Estimate Items" className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-hidden">
                <DataTable
                  data={displayItems}
                  isLoading={isLoadingItems}
                  error={itemsError as Error | null}
                  enableSorting={true}
                  enableResizing={true}
                  enableSelection={true}
                  className="h-full rounded-none shadow-none border-none"
                />
              </div>
            </BentoCard>
          </div>
        </div>
      </main>
    </div>
  );
}
