"use client";

/**
 * OpenConstructionEstimate - DataTable Component
 *
 * High-performance virtualized table for displaying 5000+ rows of construction data.
 * Uses TanStack Table for headless table logic and TanStack Virtual for row virtualization.
 *
 * Performance optimizations:
 * - Row virtualization: Only renders visible rows + overscan
 * - Memoized column definitions: Prevents re-computation on re-renders
 * - Memoized row components: React.memo with custom comparison
 * - CSS content-visibility: Browser-level rendering optimization
 * - Tabular-nums font variant: Prevents layout shift on number changes
 *
 * Accessibility:
 * - Full keyboard navigation (Arrow keys, Enter, Escape)
 * - ARIA attributes for screen readers
 * - Focus management within the table
 */

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnResizeMode,
  type Row,
  type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn, formatCurrency, formatNumber, keys, isKey } from "@/lib/utils";
import { useTableStore, useSorting } from "@/lib/stores/tableStore";
import type { ConstructionItem, DataTableProps } from "./types";

/* ============================================
   CONSTANTS
   ============================================ */

const DEFAULT_ROW_HEIGHT = 48;
const DEFAULT_OVERSCAN = 5;
const COLUMN_RESIZE_MODE: ColumnResizeMode = "onChange";

/* ============================================
   COLUMN DEFINITIONS
   Memoized outside component to prevent re-creation
   ============================================ */

const createColumns = (): ColumnDef<ConstructionItem>[] => [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
    minSize: 80,
    maxSize: 150,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-subtle">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Description",
    size: 320,
    minSize: 200,
    maxSize: 600,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="text-soft-black line-clamp-1" title={getValue<string>()}>
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "costoUnitario",
    header: () => <span className="text-right w-full block">Unit Cost</span>,
    size: 140,
    minSize: 100,
    maxSize: 200,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="text-currency text-right block">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "cantidad",
    header: () => <span className="text-right w-full block">Qty</span>,
    size: 100,
    minSize: 80,
    maxSize: 150,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="text-data text-right block">
        {formatNumber(getValue<number>(), { decimals: 2 })}
      </span>
    ),
  },
  {
    accessorKey: "unidad",
    header: "Unit",
    size: 80,
    minSize: 60,
    maxSize: 120,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="text-subtle text-xs uppercase tracking-wide">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "subtotal",
    header: () => <span className="text-right w-full block">Subtotal</span>,
    size: 160,
    minSize: 120,
    maxSize: 220,
    enableResizing: true,
    cell: ({ getValue }) => (
      <span className="text-currency font-medium text-right block text-accent-600">
        {formatCurrency(getValue<number>())}
      </span>
    ),
  },
];

/* ============================================
   TABLE ROW COMPONENT
   Memoized for performance with custom comparison
   ============================================ */

interface TableRowProps {
  row: Row<ConstructionItem>;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  onClick?: (item: ConstructionItem) => void;
  onDoubleClick?: (item: ConstructionItem) => void;
  onFocus: (index: number) => void;
  style: React.CSSProperties;
}

const TableRow = React.memo(
  function TableRow({
    row,
    index,
    isSelected,
    isFocused,
    onClick,
    onDoubleClick,
    onFocus,
    style,
  }: TableRowProps) {
    const handleClick = useCallback(() => {
      onClick?.(row.original);
    }, [onClick, row.original]);

    const handleDoubleClick = useCallback(() => {
      onDoubleClick?.(row.original);
    }, [onDoubleClick, row.original]);

    const handleFocus = useCallback(() => {
      onFocus(index);
    }, [onFocus, index]);

    return (
      <div
        role="row"
        aria-rowindex={index + 2} // +2 for header row and 1-based indexing
        aria-selected={isSelected}
        tabIndex={isFocused ? 0 : -1}
        className={cn(
          "flex items-center border-b border-border-muted",
          "transition-colors duration-100 ease-out",
          // Zebra striping with subtle alternating backgrounds
          index % 2 === 0 ? "bg-paper" : "bg-soft-black/[0.02]",
          // Hover state
          "hover:bg-accent-50/50",
          // Selected state
          isSelected && "bg-accent-100/60 hover:bg-accent-100",
          // Focused state
          isFocused && "ring-2 ring-inset ring-accent/20"
        )}
        style={style}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onFocus={handleFocus}
        data-row-index={index}
      >
        {row.getVisibleCells().map((cell) => (
          <div
            key={cell.id}
            role="cell"
            className="px-4 py-3 flex items-center overflow-hidden"
            style={{ width: cell.column.getSize() }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        ))}
      </div>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.row.original.id === nextProps.row.original.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isFocused === nextProps.isFocused &&
      prevProps.style.transform === nextProps.style.transform
    );
  }
);

/* ============================================
   RESIZE HANDLE COMPONENT
   ============================================ */

interface ResizeHandleProps {
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

function ResizeHandle({
  isResizing,
  onMouseDown,
  onTouchStart,
}: ResizeHandleProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 cursor-col-resize",
        "transition-colors duration-150",
        "hover:bg-accent/30",
        isResizing && "bg-accent/50"
      )}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    />
  );
}

/* ============================================
   SORT INDICATOR COMPONENT
   ============================================ */

interface SortIndicatorProps {
  direction: "asc" | "desc" | false;
}

function SortIndicator({ direction }: SortIndicatorProps) {
  if (!direction) {
    return (
      <span className="ml-2 text-ghost opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="ml-2 text-accent">
      {direction === "asc" ? (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      )}
    </span>
  );
}

/* ============================================
   LOADING SKELETON
   ============================================ */

function TableSkeleton({ rowCount = 10 }: { rowCount?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div
          key={i}
          className="flex items-center h-12 px-4 gap-4"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-4 flex-1" />
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-12" />
          <div className="skeleton h-4 w-28" />
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
      <div className="w-16 h-16 mb-4 rounded-full bg-cloud flex items-center justify-center">
        <svg
          className="w-8 h-8 text-whisper"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-carbon mb-1">No items found</h3>
      <p className="text-subtle text-sm">
        Try adjusting your search or filter criteria
      </p>
    </div>
  );
}

/* ============================================
   MAIN DATATABLE COMPONENT
   ============================================ */

export function DataTable({
  data,
  isLoading = false,
  error = null,
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
  enableSelection = false,
  enableResizing = true,
  enableSorting = true,
  className,
}: DataTableProps) {
  // Refs
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Local state
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Store state
  const { sorting, setSorting } = useSorting();
  const columnSizing = useTableStore((state) => state.columnSizing);
  const setColumnSizing = useTableStore((state) => state.setColumnSizing);
  const globalSearch = useTableStore((state) => state.filters.globalSearch);

  // Memoized columns
  const columns = useMemo(() => createColumns(), []);

  // Handle sorting change from TanStack Table (accepts updater function)
  const handleSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      setSorting(newSorting);
    },
    [sorting, setSorting]
  );

  // Handle column sizing change from TanStack Table
  const handleColumnSizingChange = useCallback(
    (updaterOrValue: Updater<Record<string, number>>) => {
      const newSizing =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnSizing)
          : updaterOrValue;
      setColumnSizing(newSizing);
    },
    [columnSizing, setColumnSizing]
  );

  // TanStack Table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnSizing,
      globalFilter: globalSearch,
    },
    onSortingChange: handleSortingChange,
    onColumnSizingChange: handleColumnSizingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    columnResizeMode: COLUMN_RESIZE_MODE,
    enableColumnResizing: enableResizing,
    enableSorting,
  });

  // Get rows after filtering/sorting
  const { rows } = table.getRowModel();

  // TanStack Virtual instance for row virtualization
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Padding for virtualization
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start ?? 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  // Selection change callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedRowIds));
    }
  }, [selectedRowIds, onSelectionChange]);

  // Handle row selection
  const handleRowClick = useCallback(
    (item: ConstructionItem) => {
      if (enableSelection) {
        setSelectedRowIds((prev) => {
          const next = new Set(prev);
          if (next.has(item.id)) {
            next.delete(item.id);
          } else {
            next.add(item.id);
          }
          return next;
        });
      }
      onRowClick?.(item);
    },
    [enableSelection, onRowClick]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (rows.length === 0) return;

      if (isKey(e, keys.ARROW_DOWN)) {
        e.preventDefault();
        setFocusedRowIndex((prev) => Math.min(prev + 1, rows.length - 1));
      } else if (isKey(e, keys.ARROW_UP)) {
        e.preventDefault();
        setFocusedRowIndex((prev) => Math.max(prev - 1, 0));
      } else if (isKey(e, keys.ENTER, keys.SPACE)) {
        e.preventDefault();
        if (focusedRowIndex >= 0 && focusedRowIndex < rows.length) {
          const row = rows[focusedRowIndex];
          handleRowClick(row.original);
        }
      } else if (isKey(e, keys.HOME)) {
        e.preventDefault();
        setFocusedRowIndex(0);
        virtualizer.scrollToIndex(0);
      } else if (isKey(e, keys.END)) {
        e.preventDefault();
        setFocusedRowIndex(rows.length - 1);
        virtualizer.scrollToIndex(rows.length - 1);
      } else if (isKey(e, keys.ESCAPE)) {
        e.preventDefault();
        setFocusedRowIndex(-1);
        setSelectedRowIds(new Set());
      }
    },
    [rows, focusedRowIndex, handleRowClick, virtualizer]
  );

  // Scroll focused row into view
  useEffect(() => {
    if (focusedRowIndex >= 0) {
      virtualizer.scrollToIndex(focusedRowIndex, { align: "auto" });
    }
  }, [focusedRowIndex, virtualizer]);

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
            Error loading data
          </h3>
          <p className="text-subtle text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // Calculate total width
  const totalWidth = table.getTotalSize();

  return (
    <div
      className={cn(
        "rounded-xl bg-paper shadow-soft-md overflow-hidden",
        className
      )}
    >
      {/* Scrollable container */}
      <div
        ref={tableContainerRef}
        className="overflow-auto max-h-[calc(100vh-200px)]"
        role="grid"
        aria-rowcount={rows.length + 1}
        aria-colcount={columns.length}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Table wrapper for horizontal scroll */}
        <div style={{ width: totalWidth, minWidth: "100%" }}>
          {/* Sticky Header with Glassmorphism */}
          <div
            className={cn(
              "sticky top-0 z-10",
              "bg-white/80 backdrop-blur-md",
              "border-b border-divider"
            )}
            role="row"
            aria-rowindex={1}
          >
            <div className="flex">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    role="columnheader"
                    aria-sort={
                      header.column.getIsSorted()
                        ? header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={cn(
                      "relative px-4 py-3 text-sm font-medium text-subtle",
                      "select-none group",
                      enableSorting &&
                        header.column.getCanSort() &&
                        "cursor-pointer hover:text-carbon"
                    )}
                    style={{ width: header.getSize() }}
                    onClick={
                      enableSorting && header.column.getCanSort()
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {enableSorting && header.column.getCanSort() && (
                        <SortIndicator
                          direction={header.column.getIsSorted()}
                        />
                      )}
                    </div>

                    {/* Resize Handle */}
                    {enableResizing && header.column.getCanResize() && (
                      <ResizeHandle
                        isResizing={header.column.getIsResizing()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Table Body */}
          {isLoading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            <div
              role="rowgroup"
              style={{
                height: totalSize,
                position: "relative",
              }}
            >
              {/* Top padding for virtualization */}
              {paddingTop > 0 && <div style={{ height: paddingTop }} />}

              {/* Virtual rows */}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    key={row.id}
                    row={row}
                    index={virtualRow.index}
                    isSelected={selectedRowIds.has(row.original.id)}
                    isFocused={focusedRowIndex === virtualRow.index}
                    onClick={handleRowClick}
                    onDoubleClick={onRowDoubleClick}
                    onFocus={setFocusedRowIndex}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                );
              })}

              {/* Bottom padding for virtualization */}
              {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
            </div>
          )}
        </div>
      </div>

      {/* Footer with row count */}
      <div className="px-4 py-3 border-t border-divider bg-cloud/50">
        <p className="text-xs text-subtle">
          {isLoading ? (
            <span className="shimmer inline-block w-32 h-4 rounded" />
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-carbon tabular-nums">
                {rows.length.toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="font-medium text-carbon tabular-nums">
                {data.length.toLocaleString()}
              </span>{" "}
              items
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

export default DataTable;
