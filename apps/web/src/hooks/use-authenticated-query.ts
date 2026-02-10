"use client";

import { useState, useEffect, useCallback } from "react";

interface UseAuthenticatedQueryOptions {
  enabled?: boolean;
}

/**
 * Generic hook for fetching data that requires authentication.
 * Handles loading states and auth checks automatically.
 */
export function useAuthenticatedQuery<T>(
  queryFn: () => Promise<T>,
  isAuthenticated: boolean,
  dependencies: unknown[] = [],
  options: UseAuthenticatedQueryOptions = {}
) {
  const { enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Query failed:", error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, enabled, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
