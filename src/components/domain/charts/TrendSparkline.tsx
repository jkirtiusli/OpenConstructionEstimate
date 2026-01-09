'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

/* ============================================
   TYPE DEFINITIONS
   ============================================ */

export interface TrendDataPoint {
  /** Value for this data point */
  value: number;
  /** Optional timestamp or label */
  timestamp?: string | number;
}

interface TrendSparklineProps {
  /** Array of data points to display */
  data: TrendDataPoint[];
  /** Width of the sparkline (default: 120) */
  width?: number;
  /** Height of the sparkline (default: 40) */
  height?: number;
  /** Custom class name for the container */
  className?: string;
  /** Color for positive trend (default: success green) */
  positiveColor?: string;
  /** Color for negative trend (default: error red) */
  negativeColor?: string;
  /** Color for neutral trend (default: accent blue) */
  neutralColor?: string;
  /** Stroke width of the line (default: 2) */
  strokeWidth?: number;
  /** Whether to show the gradient fill below the line (default: true) */
  showGradient?: boolean;
  /** Gradient opacity (0-1, default: 0.15) */
  gradientOpacity?: number;
  /** Animation duration in ms (default: 500) */
  animationDuration?: number;
  /** Optional trend direction override ('up' | 'down' | 'neutral') */
  trendDirection?: 'up' | 'down' | 'neutral';
  /** Whether to show dots on data points (default: false for clean look) */
  showDots?: boolean;
}

/* ============================================
   DESIGN SYSTEM COLORS
   Premium colors from Calm Tech design system
   ============================================ */

const TREND_COLORS = {
  positive: '#10B981', // Success green
  negative: '#EF4444', // Error red
  neutral: '#0066CC',  // Accent blue
} as const;

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Determines the trend direction based on data
 */
function calculateTrend(data: TrendDataPoint[]): 'up' | 'down' | 'neutral' {
  if (data.length < 2) return 'neutral';

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;

  if (lastValue > firstValue) return 'up';
  if (lastValue < firstValue) return 'down';
  return 'neutral';
}

/**
 * Gets the appropriate color based on trend direction
 */
function getTrendColor(
  trend: 'up' | 'down' | 'neutral',
  colors: { positive: string; negative: string; neutral: string }
): string {
  switch (trend) {
    case 'up':
      return colors.positive;
    case 'down':
      return colors.negative;
    default:
      return colors.neutral;
  }
}

/* ============================================
   MAIN TREND SPARKLINE COMPONENT
   Minimal, elegant trend visualization
   ============================================ */

export function TrendSparkline({
  data,
  width = 120,
  height = 40,
  className,
  positiveColor = TREND_COLORS.positive,
  negativeColor = TREND_COLORS.negative,
  neutralColor = TREND_COLORS.neutral,
  strokeWidth = 2,
  showGradient = true,
  gradientOpacity = 0.15,
  animationDuration = 500,
  trendDirection,
  showDots = false,
}: TrendSparklineProps) {
  // Determine trend and color
  const { trend, color, gradientId } = useMemo(() => {
    const trend = trendDirection || calculateTrend(data);
    const colors = {
      positive: positiveColor,
      negative: negativeColor,
      neutral: neutralColor,
    };
    const color = getTrendColor(trend, colors);
    // Unique gradient ID to prevent conflicts when multiple sparklines are rendered
    const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return { trend, color, gradientId };
  }, [data, trendDirection, positiveColor, negativeColor, neutralColor]);

  // Calculate Y-axis domain with padding for visual appeal
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 10;

    return [min - padding, max + padding];
  }, [data]);

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-cloud',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs text-whisper">No data</span>
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ width, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={gradientOpacity}
              />
              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          {/* Hidden Y-axis for proper scaling */}
          <YAxis
            domain={yDomain}
            hide
          />

          {/* Area with gradient fill */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={showGradient ? `url(#${gradientId})` : 'transparent'}
            fillOpacity={1}
            isAnimationActive={animationDuration > 0}
            animationDuration={animationDuration}
            animationEasing="ease-out"
            dot={showDots ? {
              r: 2,
              fill: color,
              stroke: 'white',
              strokeWidth: 1,
            } : false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================
   SPARKLINE WITH LABEL VARIANT
   Includes value display and trend indicator
   ============================================ */

interface TrendSparklineWithLabelProps extends TrendSparklineProps {
  /** Current/latest value to display */
  currentValue?: number;
  /** Format function for the value */
  formatValue?: (value: number) => string;
  /** Label text */
  label?: string;
  /** Show percentage change */
  showChange?: boolean;
}

export function TrendSparklineWithLabel({
  data,
  currentValue,
  formatValue = (v) => v.toLocaleString(),
  label,
  showChange = true,
  ...sparklineProps
}: TrendSparklineWithLabelProps) {
  // Calculate percentage change
  const change = useMemo(() => {
    if (data.length < 2) return null;

    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;

    if (firstValue === 0) return null;

    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    const isPositive = percentChange > 0;
    const isNegative = percentChange < 0;

    return {
      value: percentChange,
      formatted: `${isPositive ? '+' : ''}${percentChange.toFixed(1)}%`,
      isPositive,
      isNegative,
    };
  }, [data]);

  const displayValue = currentValue ?? data[data.length - 1]?.value ?? 0;

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left side: value and label */}
      <div className="flex flex-col gap-0.5 min-w-0">
        {label && (
          <span className="text-xs text-subtle truncate">{label}</span>
        )}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-carbon tabular-nums">
            {formatValue(displayValue)}
          </span>
          {showChange && change && (
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                change.isPositive && 'text-success',
                change.isNegative && 'text-error',
                !change.isPositive && !change.isNegative && 'text-subtle'
              )}
            >
              {change.formatted}
            </span>
          )}
        </div>
      </div>

      {/* Right side: sparkline */}
      <TrendSparkline data={data} {...sparklineProps} />
    </div>
  );
}

/* ============================================
   SAMPLE DATA FOR TESTING
   ============================================ */

/** Sample positive trend data */
export const samplePositiveTrend: TrendDataPoint[] = [
  { value: 45 },
  { value: 52 },
  { value: 48 },
  { value: 61 },
  { value: 55 },
  { value: 67 },
  { value: 72 },
  { value: 68 },
  { value: 78 },
  { value: 85 },
];

/** Sample negative trend data */
export const sampleNegativeTrend: TrendDataPoint[] = [
  { value: 92 },
  { value: 88 },
  { value: 91 },
  { value: 82 },
  { value: 78 },
  { value: 71 },
  { value: 74 },
  { value: 65 },
  { value: 58 },
  { value: 52 },
];

/** Sample neutral/flat trend data */
export const sampleNeutralTrend: TrendDataPoint[] = [
  { value: 50 },
  { value: 52 },
  { value: 48 },
  { value: 51 },
  { value: 49 },
  { value: 53 },
  { value: 50 },
  { value: 48 },
  { value: 52 },
  { value: 50 },
];

/** Sample cost trend over time */
export const sampleCostTrend: TrendDataPoint[] = [
  { value: 125000, timestamp: '2024-01' },
  { value: 132000, timestamp: '2024-02' },
  { value: 128000, timestamp: '2024-03' },
  { value: 145000, timestamp: '2024-04' },
  { value: 152000, timestamp: '2024-05' },
  { value: 148000, timestamp: '2024-06' },
  { value: 167000, timestamp: '2024-07' },
  { value: 175000, timestamp: '2024-08' },
];

/* ============================================
   EXPORTS
   ============================================ */

export default TrendSparkline;

/**
 * Usage Examples:
 *
 * Basic sparkline:
 * ```tsx
 * import { TrendSparkline, samplePositiveTrend } from '@/components/domain/charts/TrendSparkline';
 *
 * function MetricCard() {
 *   return (
 *     <div className="card p-4 flex items-center justify-between">
 *       <div>
 *         <p className="text-caption">Monthly Revenue</p>
 *         <p className="text-title">$175,000</p>
 *       </div>
 *       <TrendSparkline
 *         data={samplePositiveTrend}
 *         width={100}
 *         height={32}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Sparkline with label:
 * ```tsx
 * import { TrendSparklineWithLabel, sampleCostTrend } from '@/components/domain/charts/TrendSparkline';
 * import { formatCurrency } from '@/lib/utils';
 *
 * function CostMetric() {
 *   return (
 *     <div className="card p-4">
 *       <TrendSparklineWithLabel
 *         data={sampleCostTrend}
 *         label="Total Cost"
 *         currentValue={175000}
 *         formatValue={(v) => formatCurrency(v, { compact: true })}
 *         width={80}
 *         height={28}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Props:
 * - data: Array of TrendDataPoint objects (value, optional timestamp)
 * - width: Chart width in pixels (default: 120)
 * - height: Chart height in pixels (default: 40)
 * - positiveColor: Color for upward trends (default: #10B981)
 * - negativeColor: Color for downward trends (default: #EF4444)
 * - neutralColor: Color for flat trends (default: #0066CC)
 * - strokeWidth: Line thickness (default: 2)
 * - showGradient: Show gradient fill below line (default: true)
 * - gradientOpacity: Opacity of gradient (default: 0.15)
 * - animationDuration: Entry animation duration in ms (default: 500)
 * - trendDirection: Override automatic trend detection
 * - showDots: Show dots on data points (default: false)
 */
