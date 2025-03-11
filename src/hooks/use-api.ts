import { useState, useCallback, useRef } from 'react';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: HeadersInit;
  cache?: boolean;
  timeout?: number;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

type CacheRecord<T = unknown> = {
  timestamp: number;
  data: T;
};

const DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutos
const apiCache = new Map<string, CacheRecord<unknown>>();

export function useApi<T>(initialUrl: string, initialOptions?: ApiOptions) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = (url: string, options?: ApiOptions) => {
    if (!options || options.method === 'GET') {
      return url;
    }
    return '';
  };

  const fetchData = useCallback(
    async (
      url: string = initialUrl,
      options: ApiOptions = initialOptions || {}
    ) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({ ...prev, loading: true, error: null }));

      const cacheKey = getCacheKey(url, options);
      if (options.cache !== false && cacheKey && apiCache.has(cacheKey)) {
        const cachedData = apiCache.get(cacheKey);
        if (
          cachedData &&
          Date.now() - cachedData.timestamp < DEFAULT_CACHE_TIME
        ) {
          setState({ data: cachedData.data as T, loading: false, error: null });
          return cachedData.data;
        }
      }

      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const headers = {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          ...options.headers,
        };

        const timeoutPromise = options.timeout
          ? new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error('Request timeout')),
                options.timeout
              )
            )
          : null;

        const fetchPromise = fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        const response = await (timeoutPromise
          ? Promise.race([fetchPromise, timeoutPromise])
          : fetchPromise);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json();

        if (options.cache !== false && cacheKey) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        throw error;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [initialUrl, initialOptions]
  );

  const clearCache = useCallback((specificUrl?: string) => {
    if (specificUrl) {
      apiCache.delete(specificUrl);
    } else {
      apiCache.clear();
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    ...state,
    fetchData,
    clearCache,
    cancelRequest,
  };
}
