import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedFetch } from '@/utils/cache';
import { errorReporter } from '@/utils/errorReporting';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseOptimizedFetchOptions {
  cacheKey?: string;
  cacheTTL?: number;
  retryAttempts?: number;
  retryDelay?: number;
  dependencies?: any[];
}

export function useOptimizedFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseOptimizedFetchOptions = {}
) {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retryAttempts = 3,
    retryDelay = 1000,
    dependencies = [],
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const retryCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const executeWithRetry = useCallback(async (fn: () => Promise<T>, attempt = 0): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        return executeWithRetry(fn, attempt + 1);
      }
      throw error;
    }
  }, [retryAttempts, retryDelay]);

  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let data: T;
      
      if (cacheKey) {
        data = await cachedFetch(cacheKey, () => executeWithRetry(fetchFn), cacheTTL);
      } else {
        data = await executeWithRetry(fetchFn);
      }

      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (error: any) {
      errorReporter.reportError(error, { context: 'useOptimizedFetch', cacheKey });
      
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error.message || 'An error occurred',
        });
      }
    }
  }, [fetchFn, cacheKey, cacheTTL, executeWithRetry]);

  const refetch = useCallback(() => {
    retryCountRef.current = 0;
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch,
  };
}
