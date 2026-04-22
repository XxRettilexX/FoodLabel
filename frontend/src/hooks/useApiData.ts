import { useState, useCallback } from 'react';

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Errore durante il caricamento dei dati';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const refresh = useCallback(() => {
    return load();
  }, [load]);

  return { data, loading, error, load, refresh, setData };
}
