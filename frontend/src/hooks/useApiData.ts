import { useState, useCallback, useRef } from 'react';

/**
 * Hook generico per gestire fetch dati da API.
 * Gestisce loading, error e refresh in modo uniforme.
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      // Bug fix: ignore stale responses when fetcher/params change before earlier requests finish.
      if (requestId !== requestIdRef.current) {
        return;
      }
      setData(result);
    } catch (err: any) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Errore durante il caricamento dei dati';
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]);

  const refresh = useCallback(() => {
    return load();
  }, [load]);

  return { data, loading, error, load, refresh, setData };
}
