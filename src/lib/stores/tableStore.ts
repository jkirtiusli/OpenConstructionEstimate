/**
 * OpenConstructionEstimate - Table Store
 *
 * Zustand store for managing table/grid state with localStorage persistence.
 * Handles view mode switching, filtering, sorting, and column configuration.
 *
 * Performance considerations:
 * - Shallow merges for partial updates
 * - Persisted to localStorage for session continuity
 * - Actions are stable references (no re-renders on access)
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
  TableStore,
  ViewMode,
  TableFilters,
  FilterCondition,
  ColumnKey,
} from "@/components/domain/data/types";
import {
  DEFAULT_VISIBLE_COLUMNS,
  DEFAULT_FILTERS,
} from "@/components/domain/data/types";

/* ============================================
   INITIAL STATE
   ============================================ */

const initialState = {
  viewMode: "table" as ViewMode,
  filters: DEFAULT_FILTERS,
  visibleColumns: DEFAULT_VISIBLE_COLUMNS,
  sorting: [] as SortingState,
  columnVisibility: {} as VisibilityState,
  columnSizing: {} as Record<string, number>,
};

/* ============================================
   STORE DEFINITION
   ============================================ */

export const useTableStore = create<TableStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      /* ============================================
         VIEW MODE ACTIONS
         ============================================ */

      /**
       * Sets the view mode (table or grid)
       */
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode });
      },

      /* ============================================
         FILTER ACTIONS
         ============================================ */

      /**
       * Replaces all filters with new filter state
       */
      setFilters: (filters: TableFilters) => {
        set({ filters });
      },

      /**
       * Updates the global search string
       */
      setGlobalSearch: (search: string) => {
        set((state) => ({
          filters: {
            ...state.filters,
            globalSearch: search,
          },
        }));
      },

      /**
       * Adds a new filter condition
       */
      addFilterCondition: (condition: FilterCondition) => {
        set((state) => ({
          filters: {
            ...state.filters,
            conditions: [...state.filters.conditions, condition],
          },
        }));
      },

      /**
       * Removes a filter condition by index
       */
      removeFilterCondition: (index: number) => {
        set((state) => ({
          filters: {
            ...state.filters,
            conditions: state.filters.conditions.filter((_, i) => i !== index),
          },
        }));
      },

      /**
       * Clears all filters back to defaults
       */
      clearFilters: () => {
        set({ filters: DEFAULT_FILTERS });
      },

      /* ============================================
         COLUMN VISIBILITY ACTIONS
         ============================================ */

      /**
       * Sets which columns are visible
       */
      setVisibleColumns: (columns: ColumnKey[]) => {
        set({ visibleColumns: columns });
      },

      /**
       * Toggles a single column's visibility
       */
      toggleColumn: (column: ColumnKey) => {
        const { visibleColumns } = get();
        const isVisible = visibleColumns.includes(column);

        if (isVisible) {
          // Don't allow hiding all columns
          if (visibleColumns.length > 1) {
            set({
              visibleColumns: visibleColumns.filter((c) => c !== column),
            });
          }
        } else {
          set({
            visibleColumns: [...visibleColumns, column],
          });
        }
      },

      /* ============================================
         SORTING ACTIONS
         ============================================ */

      /**
       * Sets the sorting state
       */
      setSorting: (sorting: SortingState) => {
        set({ sorting });
      },

      /* ============================================
         COLUMN SIZING ACTIONS
         ============================================ */

      /**
       * Sets column visibility state (TanStack Table compatible)
       */
      setColumnVisibility: (visibility: VisibilityState) => {
        set({ columnVisibility: visibility });
      },

      /**
       * Sets column sizing state for resizable columns
       */
      setColumnSizing: (sizing: Record<string, number>) => {
        set({ columnSizing: sizing });
      },

      /* ============================================
         RESET ACTION
         ============================================ */

      /**
       * Resets all state to initial values
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "oce-table-store", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields to avoid bloating storage
      partialize: (state: TableStore) => ({
        viewMode: state.viewMode,
        visibleColumns: state.visibleColumns,
        sorting: state.sorting,
        columnVisibility: state.columnVisibility,
        columnSizing: state.columnSizing,
        // Note: We don't persist filters - they should be fresh each session
      }),
    }
  )
);

/* ============================================
   SELECTORS
   Performance-optimized selectors for specific state slices
   ============================================ */

/**
 * Select just the view mode (avoids re-renders when other state changes)
 */
export const selectViewMode = (state: TableStore) => state.viewMode;

/**
 * Select just the filters
 */
export const selectFilters = (state: TableStore) => state.filters;

/**
 * Select just the global search string
 */
export const selectGlobalSearch = (state: TableStore) =>
  state.filters.globalSearch;

/**
 * Select just the sorting state
 */
export const selectSorting = (state: TableStore) => state.sorting;

/**
 * Select just the visible columns
 */
export const selectVisibleColumns = (state: TableStore) => state.visibleColumns;

/**
 * Select just the column sizing
 */
export const selectColumnSizing = (state: TableStore) => state.columnSizing;

/* ============================================
   HOOKS
   Convenience hooks for common patterns
   ============================================ */

/**
 * Hook for view mode with toggle action
 */
export function useViewMode() {
  const viewMode = useTableStore(selectViewMode);
  const setViewMode = useTableStore((state) => state.setViewMode);

  const toggleViewMode = () => {
    setViewMode(viewMode === "table" ? "grid" : "table");
  };

  return { viewMode, setViewMode, toggleViewMode };
}

/**
 * Hook for search functionality
 */
export function useSearch() {
  const globalSearch = useTableStore(selectGlobalSearch);
  const setGlobalSearch = useTableStore((state) => state.setGlobalSearch);
  const clearFilters = useTableStore((state) => state.clearFilters);

  return { globalSearch, setGlobalSearch, clearFilters };
}

/**
 * Hook for sorting functionality
 */
export function useSorting() {
  const sorting = useTableStore(selectSorting);
  const setSorting = useTableStore((state) => state.setSorting);

  return { sorting, setSorting };
}
