/**
 * OpenConstructionEstimate - React Query Provider
 *
 * Configures and provides the React Query client for the application.
 * Sets sensible defaults for caching and stale time to optimize
 * API calls and provide a smooth user experience.
 *
 * Cache Strategy:
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - gcTime: 10 minutes - Inactive data is garbage collected after 10 minutes
 * - retry: 2 - Failed requests retry twice before throwing
 * - refetchOnWindowFocus: false - Don't refetch on tab focus (reduces API calls)
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/* ============================================
   QUERY CLIENT CONFIGURATION
   ============================================ */

/**
 * Creates a new QueryClient with optimized defaults
 */
function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data freshness: 5 minutes
        staleTime: 5 * 60 * 1000,

        // Garbage collection: 10 minutes after last use
        gcTime: 10 * 60 * 1000,

        // Retry failed requests twice with exponential backoff
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on window focus for a calmer UX
        refetchOnWindowFocus: false,

        // Don't refetch on mount if data exists
        refetchOnMount: false,

        // Keep previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData,
      },
      mutations: {
        // Retry mutations once on failure
        retry: 1,
      },
    },
  });
}

/* ============================================
   PROVIDER COMPONENT
   ============================================ */

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the application with React Query context.
 *
 * Uses useState to ensure the QueryClient is created once per component
 * instance, avoiding shared state between server and client in Next.js.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient once per component instance
  // This pattern ensures proper SSR/CSR separation in Next.js
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

/* ============================================
   EXPORTS
   ============================================ */

export default QueryProvider;
