'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

export interface CostCategory {
  /** Unique identifier for the category */
  id: string;
  /** Display name of the cost category */
  name: string;
  /** Cost value in dollars */
  value: number;
  /** Optional custom color (uses design system colors by default) */
  color?: string;
}

interface CostDonutProps {
  /** Array of cost categories to display */
  data: CostCategory[];
  /** Chart title (optional) */
  title?: string;
  /** Custom class name for the container */
  className?: string;
  /** Size of the donut chart in pixels */
  size?: number;
  /** Inner radius ratio (0-1, default 0.6 for donut effect) */
  innerRadiusRatio?: number;
  /** Whether to show the center total */
  showCenterTotal?: boolean;
  /** Label for the center total */
  centerLabel?: string;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Callback when a segment is clicked */
  onSegmentClick?: (category: CostCategory) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CostCategory & { percentage: number; color: string };
  }>;
}

/* ============================================
   DESIGN SYSTEM COLORS
   Premium palette from Calm Tech design system
   ============================================ */

const CHART_COLORS = [
  '#0066CC', // Accent blue (primary)
  '#10B981', // Success green
  '#F59E0B', // Warning amber
  '#3B82F6', // Info blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
] as const;

/* ============================================
   CUSTOM TOOLTIP
   Elegant tooltip with soft shadows
   ============================================ */

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0];
  const category = data.payload;

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl',
        'bg-paper/95 backdrop-blur-sm',
        'shadow-soft-lg border border-border-soft',
        'animate-fade-in'
      )}
    >
      {/* Category name */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm font-medium text-carbon">
          {category.name}
        </span>
      </div>

      {/* Value and percentage */}
      <div className="space-y-1">
        <p className="text-lg font-semibold text-carbon tabular-nums">
          {formatCurrency(category.value)}
        </p>
        <p className="text-xs text-subtle">
          {category.percentage.toFixed(1)}% of total
        </p>
      </div>
    </div>
  );
}

/* ============================================
   CENTER TOTAL DISPLAY
   Shows total value in the donut center
   ============================================ */

interface CenterTotalProps {
  total: number;
  label: string;
}

function CenterTotal({ total, label }: CenterTotalProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span
        className="text-2xl font-semibold text-carbon tabular-nums"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {formatCurrency(total, { compact: true })}
      </span>
      <span
        className="text-xs font-medium text-subtle uppercase tracking-wider mt-1"
        style={{ fontFamily: 'var(--font-sans)' }}
      >
        {label}
      </span>
    </div>
  );
}

/* ============================================
   MAIN COST DONUT COMPONENT
   Premium budget breakdown visualization
   ============================================ */

export function CostDonut({
  data,
  title,
  className,
  size = 280,
  innerRadiusRatio = 0.6,
  showCenterTotal = true,
  centerLabel = 'Total Budget',
  animationDuration = 800,
  onSegmentClick,
}: CostDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Calculate total and add colors/percentages to data
  const { chartData, total } = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = data.map((item, index) => ({
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      percentage: total > 0 ? (item.value / total) * 100 : 0,
    }));

    return { chartData, total };
  }, [data]);

  // Calculate radii
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius * innerRadiusRatio;

  // Event handlers for Pie
  const handlePieMouseEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const handlePieMouseLeave = useCallback(() => {
    setActiveIndex(undefined);
  }, []);

  const handleClick = useCallback(
    (entry: CostCategory) => {
      onSegmentClick?.(entry);
    },
    [onSegmentClick]
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        className
      )}
    >
      {/* Title */}
      {title && (
        <h3 className="text-subtitle mb-4 text-center">{title}</h3>
      )}

      {/* Chart container */}
      <div
        className="relative"
        style={{ width: size, height: size }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeLinecap="round"
              strokeWidth={0}
              onMouseEnter={handlePieMouseEnter}
              onMouseLeave={handlePieMouseLeave}
              onClick={(_, index) => handleClick(chartData[index])}
              animationBegin={0}
              animationDuration={animationDuration}
              animationEasing="ease-out"
              style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.id}`}
                  fill={entry.color}
                  stroke="none"
                  style={{
                    transition: 'all 0.2s ease-out',
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.5,
                    transform: activeIndex === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center',
                    filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))' : 'none',
                  }}
                />
              ))}
            </Pie>

            {/* Custom tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
              wrapperStyle={{ outline: 'none' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center total - positioned absolutely */}
        {showCenterTotal && (
          <CenterTotal total={total} label={centerLabel} />
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 w-full max-w-xs">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {chartData.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-lg',
                'transition-all duration-200 ease-out',
                'hover:bg-cloud',
                activeIndex === index && 'bg-cloud'
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              onClick={() => handleClick(entry)}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted whitespace-nowrap">
                {entry.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   SAMPLE DATA FOR TESTING
   Realistic construction cost breakdown
   ============================================ */

export const sampleCostData: CostCategory[] = [
  { id: 'labor', name: 'Labor', value: 245000 },
  { id: 'materials', name: 'Materials', value: 189000 },
  { id: 'equipment', name: 'Equipment', value: 67000 },
  { id: 'subcontractors', name: 'Subcontractors', value: 123000 },
  { id: 'overhead', name: 'Overhead', value: 45000 },
  { id: 'permits', name: 'Permits & Fees', value: 18000 },
];

/* ============================================
   EXPORTS
   ============================================ */

export default CostDonut;

/**
 * Usage Example:
 *
 * ```tsx
 * import { CostDonut, sampleCostData } from '@/components/domain/charts/CostDonut';
 *
 * function BudgetOverview() {
 *   return (
 *     <div className="card p-6">
 *       <CostDonut
 *         data={sampleCostData}
 *         title="Budget Breakdown"
 *         size={300}
 *         showCenterTotal={true}
 *         centerLabel="Total Budget"
 *         onSegmentClick={(category) => {
 *           console.log('Clicked:', category.name);
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Props:
 * - data: Array of CostCategory objects (id, name, value, optional color)
 * - title: Optional chart title
 * - size: Chart size in pixels (default: 280)
 * - innerRadiusRatio: Donut hole size ratio (default: 0.6)
 * - showCenterTotal: Display total in center (default: true)
 * - centerLabel: Label for center total (default: 'Total Budget')
 * - animationDuration: Entry animation duration in ms (default: 800)
 * - onSegmentClick: Callback when a segment is clicked
 */
