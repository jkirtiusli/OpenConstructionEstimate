"use client";

/**
 * OpenConstructionEstimate - EstimateGrid Component
 *
 * Gallery view for construction materials with visual card layout.
 * Optimized for discovery and visual browsing of materials.
 *
 * Features:
 * - Responsive CSS Grid with auto-fill and minmax
 * - Cards with 1:1 aspect ratio for visual consistency
 * - Price pill positioned in corner
 * - Hover effects with elevation and translation
 * - Lazy loading images with blur-up placeholders
 * - Keyboard accessible with focus management
 *
 * Design tokens from Calm Tech design system:
 * - card-interactive class for hover states
 * - shadow-soft-* for elevation
 * - rounded-xl for consistent corners
 */

import React, { useCallback, useState, useRef } from "react";
import { cn, formatCurrency, formatNumber, keys, isKey } from "@/lib/utils";
import type { ConstructionItem, EstimateGridProps } from "./types";

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULT_MIN_CARD_WIDTH = 280;
const DEFAULT_MAX_CARD_WIDTH = 400;

/* ============================================
   IMAGE PLACEHOLDER COMPONENT
   Blur placeholder while image loads
   ============================================ */

interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  className?: string;
}

function ImageWithPlaceholder({ src, alt, className }: ImagePlaceholderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Default placeholder when no image
  if (!src || hasError) {
    return (
      <div
        className={cn(
          "w-full h-full bg-cloud flex items-center justify-center",
          className
        )}
      >
        <svg
          className="w-12 h-12 text-ghost"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full relative overflow-hidden", className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-cloud animate-pulse" />
      )}

      {/* Actual image with lazy loading */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover",
          "transition-opacity duration-300 ease-out",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

/* ============================================
   PRICE PILL COMPONENT
   Positioned absolute in corner
   ============================================ */

interface PricePillProps {
  amount: number;
  className?: string;
}

function PricePill({ amount, className }: PricePillProps) {
  return (
    <div
      className={cn(
        "absolute top-3 right-3",
        "px-3 py-1.5 rounded-lg",
        "bg-paper/90 backdrop-blur-sm",
        "shadow-soft-md",
        "text-currency text-sm font-medium text-accent-600",
        className
      )}
    >
      {formatCurrency(amount)}
    </div>
  );
}

/* ============================================
   QUANTITY BADGE COMPONENT
   ============================================ */

interface QuantityBadgeProps {
  cantidad: number;
  unidad: string;
}

function QuantityBadge({ cantidad, unidad }: QuantityBadgeProps) {
  return (
    <span className="badge">
      {formatNumber(cantidad, { decimals: 2 })} {unidad}
    </span>
  );
}

/* ============================================
   ESTIMATE CARD COMPONENT
   ============================================ */

interface EstimateCardProps {
  item: ConstructionItem;
  onClick?: (item: ConstructionItem) => void;
  isFocused: boolean;
  onFocus: () => void;
}

const EstimateCard = React.memo(function EstimateCard({
  item,
  onClick,
  isFocused,
  onFocus,
}: EstimateCardProps) {
  const handleClick = useCallback(() => {
    onClick?.(item);
  }, [onClick, item]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isKey(e, keys.ENTER, keys.SPACE)) {
        e.preventDefault();
        onClick?.(item);
      }
    },
    [onClick, item]
  );

  return (
    <article
      className={cn(
        // Base card styles from design system
        "card-interactive",
        "group cursor-pointer",
        "flex flex-col overflow-hidden",
        // Custom hover transform
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1 hover:shadow-soft-xl",
        // Focus state
        isFocused && "ring-2 ring-accent/20 ring-offset-2 ring-offset-paper"
      )}
      tabIndex={0}
      role="button"
      aria-label={`${item.descripcion}, ${formatCurrency(item.subtotal)}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      {/* Image container with 1:1 aspect ratio */}
      <div className="relative aspect-square bg-cloud overflow-hidden">
        <ImageWithPlaceholder
          src={item.imagenUrl}
          alt={item.descripcion}
        />

        {/* Price pill in corner */}
        <PricePill amount={item.subtotal} />

        {/* Hover overlay with action button */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200 ease-out",
            "flex items-end justify-center pb-4"
          )}
        >
          <button
            className={cn(
              "px-4 py-2 rounded-lg",
              "bg-paper/90 backdrop-blur-sm",
              "text-sm font-medium text-carbon",
              "shadow-soft-md",
              "transform translate-y-2 group-hover:translate-y-0",
              "transition-transform duration-200 ease-out"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(item);
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category badge if available */}
        {item.categoria && (
          <span className="text-label text-xs mb-2">{item.categoria}</span>
        )}

        {/* Title */}
        <h3
          className={cn(
            "text-base font-medium text-carbon",
            "line-clamp-2 mb-2"
          )}
          title={item.descripcion}
        >
          {item.descripcion}
        </h3>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer with quantity and unit cost */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-muted">
          <QuantityBadge cantidad={item.cantidad} unidad={item.unidad} />
          <span className="text-subtle text-sm">
            {formatCurrency(item.costoUnitario)}/{item.unidad}
          </span>
        </div>
      </div>
    </article>
  );
});

/* ============================================
   LOADING SKELETON
   ============================================ */

function GridSkeleton({
  count = 8,
  minCardWidth,
  maxCardWidth,
}: {
  count?: number;
  minCardWidth: number;
  maxCardWidth: number;
}) {
  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, ${maxCardWidth}px))`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card overflow-hidden"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Image skeleton */}
          <div className="aspect-square skeleton" />

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="skeleton-text w-1/3" />
            <div className="skeleton-title" />
            <div className="skeleton-text w-2/3" />
            <div className="flex justify-between pt-3 border-t border-border-muted">
              <div className="skeleton h-6 w-20 rounded-lg" />
              <div className="skeleton h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   EMPTY STATE
   ============================================ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 mb-6 rounded-full bg-cloud flex items-center justify-center">
        <svg
          className="w-10 h-10 text-whisper"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-carbon mb-2">No materials found</h3>
      <p className="text-subtle text-sm max-w-sm">
        Try adjusting your search or filter criteria to find materials
      </p>
    </div>
  );
}

/* ============================================
   MAIN ESTIMATEGRID COMPONENT
   ============================================ */

export function EstimateGrid({
  data,
  isLoading = false,
  error = null,
  onCardClick,
  className,
  minCardWidth = DEFAULT_MIN_CARD_WIDTH,
  maxCardWidth = DEFAULT_MAX_CARD_WIDTH,
}: EstimateGridProps) {
  // State
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (data.length === 0) return;

      // Calculate columns based on grid layout
      const grid = gridRef.current;
      if (!grid) return;

      const gridStyle = window.getComputedStyle(grid);
      const columns = gridStyle.gridTemplateColumns.split(" ").length;

      if (isKey(e, keys.ARROW_RIGHT)) {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + 1, data.length - 1)
        );
      } else if (isKey(e, keys.ARROW_LEFT)) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (isKey(e, keys.ARROW_DOWN)) {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min(prev + columns, data.length - 1)
        );
      } else if (isKey(e, keys.ARROW_UP)) {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - columns, 0));
      } else if (isKey(e, keys.HOME)) {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (isKey(e, keys.END)) {
        e.preventDefault();
        setFocusedIndex(data.length - 1);
      } else if (isKey(e, keys.ESCAPE)) {
        e.preventDefault();
        setFocusedIndex(-1);
      }
    },
    [data.length]
  );

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-xl bg-paper shadow-soft-md p-8", className)}>
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-error-light flex items-center justify-center">
            <svg
              className="w-8 h-8 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-carbon mb-1">
            Error loading materials
          </h3>
          <p className="text-subtle text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("p-6", className)}>
        <GridSkeleton
          minCardWidth={minCardWidth}
          maxCardWidth={maxCardWidth}
        />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("rounded-xl bg-paper shadow-soft-md", className)}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      ref={gridRef}
      className={cn("p-6", className)}
      role="grid"
      aria-label="Materials gallery"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Grid layout using CSS Grid with auto-fill */}
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}px, 1fr))`,
        }}
      >
        {data.map((item, index) => (
          <EstimateCard
            key={item.id}
            item={item}
            onClick={onCardClick}
            isFocused={focusedIndex === index}
            onFocus={() => setFocusedIndex(index)}
          />
        ))}
      </div>

      {/* Footer with item count */}
      <div className="mt-6 pt-6 border-t border-divider">
        <p className="text-xs text-subtle text-center">
          Showing{" "}
          <span className="font-medium text-carbon tabular-nums">
            {data.length.toLocaleString()}
          </span>{" "}
          materials
        </p>
      </div>
    </div>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

export default EstimateGrid;
