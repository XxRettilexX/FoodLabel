import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import type { AxiosError } from 'axios';

/**
 * Hook generico per submit form verso API.
 * Gestisce submitting state e errori di validazione.
 */
export function useApiSubmit<TPayload, TResult>(
  submitter: (payload: TPayload) => Promise<TResult>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: TResult) => void;
  },
) {
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const submit = useCallback(
    async (payload: TPayload) => {
      setSubmitting(true);
      setFieldErrors({});
      try {
        const result = await submitter(payload);
        if (options?.successMessage) {
          Alert.alert('Successo', options.successMessage);
        }
        options?.onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        // BUG 2 FIX: changed from `any` to `unknown` with proper type narrowing.
        const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
        // Gestione errori di validazione Laravel (422)
        if (axiosErr?.response?.status === 422 && axiosErr.response.data?.errors) {
          setFieldErrors(axiosErr.response.data.errors);
        }
        const message =
          axiosErr?.response?.data?.message ||
          options?.errorMessage ||
          'Operazione fallita. Riprova.';
        Alert.alert('Errore', message);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [submitter, options],
  );

  return { submit, submitting, fieldErrors };
}
