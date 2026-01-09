"use client";

/**
 * OpenConstructionEstimate - DataViewDemo Component
 *
 * Demo component showcasing DataTable and EstimateGrid with view switching.
 * Includes search functionality and displays the power of the Zustand store.
 */

import React, { useState, useMemo, useCallback } from "react";
import { cn, debounce } from "@/lib/utils";
import { useTableStore, useViewMode, useSearch } from "@/lib/stores/tableStore";
import { DataTable } from "./DataTable";
import { EstimateGrid } from "./EstimateGrid";
import { MOCK_CONSTRUCTION_ITEMS, generateMockItems } from "./mockData";
import type { ConstructionItem } from "./types";

/* ============================================
   VIEW TOGGLE COMPONENT
   ============================================ */

function ViewToggle() {
  const { viewMode, setViewMode } = useViewMode();

  return (
    <div className="inline-flex items-center rounded-xl bg-cloud p-1">
      <button
        onClick={() => setViewMode("table")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          viewMode === "table"
            ? "bg-paper text-carbon shadow-soft-sm"
            : "text-subtle hover:text-carbon"
        )}
      >
        <span className="flex items-center gap-2">
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
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          Table
        </span>
      </button>
      <button
        onClick={() => setViewMode("grid")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          viewMode === "grid"
            ? "bg-paper text-carbon shadow-soft-sm"
            : "text-subtle hover:text-carbon"
        )}
      >
        <span className="flex items-center gap-2">
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
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Grid
        </span>
      </button>
    </div>
  );
}

/* ============================================
   SEARCH INPUT COMPONENT
   ============================================ */

function SearchInput() {
  const { globalSearch, setGlobalSearch, clearFilters } = useSearch();
  const [localValue, setLocalValue] = useState(globalSearch);

  // Debounced search update
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setGlobalSearch(value), 300),
    [setGlobalSearch]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalValue(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  const handleClear = useCallback(() => {
    setLocalValue("");
    clearFilters();
  }, [clearFilters]);

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-whisper"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder="Search materials..."
        className="input pl-11 pr-10 w-64"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-cloud transition-colors"
        >
          <svg
            className="w-4 h-4 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ============================================
   DATA SIZE SELECTOR
   ============================================ */

interface DataSizeSelectorProps {
  value: number;
  onChange: (size: number) => void;
}

function DataSizeSelector({ value, onChange }: DataSizeSelectorProps) {
  const sizes = [50, 500, 1000, 5000, 10000];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-subtle">Items:</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input py-2 px-3 w-auto text-sm"
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size.toLocaleString()}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================
   MAIN DEMO COMPONENT
   ============================================ */

export function DataViewDemo() {
  const { viewMode } = useViewMode();
  const globalSearch = useTableStore((state) => state.filters.globalSearch);
  const [dataSize, setDataSize] = useState(50);
  const [selectedItem, setSelectedItem] = useState<ConstructionItem | null>(
    null
  );

  // Generate data based on selected size
  const data = useMemo(() => {
    if (dataSize === 50) return MOCK_CONSTRUCTION_ITEMS;
    return generateMockItems(dataSize);
  }, [dataSize]);

  // Filter data based on global search
  const filteredData = useMemo(() => {
    if (!globalSearch) return data;
    const search = globalSearch.toLowerCase();
    return data.filter(
      (item) =>
        item.descripcion.toLowerCase().includes(search) ||
        item.id.toLowerCase().includes(search) ||
        item.categoria?.toLowerCase().includes(search)
    );
  }, [data, globalSearch]);

  const handleItemClick = useCallback((item: ConstructionItem) => {
    setSelectedItem(item);
  }, []);

  return (
    <div className="min-h-screen bg-cloud">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-paper/80 backdrop-blur-md border-b border-divider">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-carbon">
              Construction Estimate
            </h1>

            <div className="flex items-center gap-4">
              <SearchInput />
              <DataSizeSelector value={dataSize} onChange={setDataSize} />
              <ViewToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {/* Stats Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-label">Total Items</p>
              <p className="text-2xl font-semibold text-carbon tabular-nums">
                {filteredData.length.toLocaleString()}
              </p>
            </div>
            <div className="h-10 w-px bg-divider" />
            <div>
              <p className="text-label">Total Value</p>
              <p className="text-2xl font-semibold text-accent-600 tabular-nums">
                $
                {filteredData
                  .reduce((sum, item) => sum + item.subtotal, 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {globalSearch && (
            <div className="badge-accent">
              Filtered by: &quot;{globalSearch}&quot;
            </div>
          )}
        </div>

        {/* Data View */}
        {viewMode === "table" ? (
          <DataTable
            data={filteredData}
            onRowClick={handleItemClick}
            enableSelection
            enableResizing
            enableSorting
          />
        ) : (
          <EstimateGrid
            data={filteredData}
            onCardClick={handleItemClick}
          />
        )}
      </main>

      {/* Selected Item Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="card-elevated max-w-md w-full p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-label">{selectedItem.id}</p>
                <h2 className="text-lg font-semibold text-carbon mt-1">
                  {selectedItem.descripcion}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn-icon"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {selectedItem.categoria && (
              <span className="badge mb-4">{selectedItem.categoria}</span>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-cloud">
                <p className="text-label">Unit Cost</p>
                <p className="text-xl font-semibold text-carbon text-currency mt-1">
                  ${selectedItem.costoUnitario.toLocaleString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-cloud">
                <p className="text-label">Quantity</p>
                <p className="text-xl font-semibold text-carbon text-data mt-1">
                  {selectedItem.cantidad.toLocaleString()} {selectedItem.unidad}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-accent-50 border border-accent-100">
              <p className="text-label text-accent-600">Subtotal</p>
              <p className="text-2xl font-semibold text-accent-600 text-currency mt-1">
                ${selectedItem.subtotal.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn-secondary flex-1">Edit</button>
              <button className="btn-primary flex-1">Add to Estimate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataViewDemo;
