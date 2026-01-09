'use client';

import { useState, useCallback } from 'react';
import { MainSidebar } from '@/components/layout/MainSidebar';
import { BIMViewer } from '@/components/domain/bim/BIMViewer';
import { DataTable } from '@/components/domain/data/DataTable';
import { CostDonut, sampleCostData } from '@/components/domain/charts/CostDonut';
import {
  TrendSparklineWithLabel,
  sampleCostTrend,
} from '@/components/domain/charts/TrendSparkline';
import { MOCK_CONSTRUCTION_ITEMS } from '@/components/domain/data/mockData';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

interface MetricCardProps {
  label: string;
  value: string;
  trend?: React.ReactNode;
  className?: string;
}

/* ============================================
   METRIC CARD COMPONENT
   Small stat card for key metrics
   ============================================ */

function MetricCard({ label, value, trend, className }: MetricCardProps) {
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
        <p className="text-xl font-semibold text-carbon tabular-nums">{value}</p>
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
}

function BentoCard({ title, children, className }: BentoCardProps) {
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
      {children}
    </div>
  );
}

/* ============================================
   MAIN DASHBOARD PAGE
   Bento grid layout with sidebar
   ============================================ */

export default function DashboardPage() {
  const [activeRoute, setActiveRoute] = useState('/');

  const handleNavigate = useCallback((route: string) => {
    setActiveRoute(route);
    // In a real app, this would use Next.js router
    console.log('Navigate to:', route);
  }, []);

  // Calculate total from mock data
  const totalCost = MOCK_CONSTRUCTION_ITEMS.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

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
                value={MOCK_CONSTRUCTION_ITEMS.length.toLocaleString()}
              />
              <MetricCard
                label="Categories"
                value="14"
              />
            </div>
          </div>

          {/* Right Column - 40% - Data & Charts */}
          <div className="w-[40%] flex flex-col gap-3">
            {/* Cost Breakdown Donut */}
            <BentoCard title="Budget Breakdown" className="shrink-0">
              <div className="p-4">
                <CostDonut
                  data={sampleCostData}
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
                  data={MOCK_CONSTRUCTION_ITEMS}
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
