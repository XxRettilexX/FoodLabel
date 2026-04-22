import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

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
      } catch (err: any) {
        // Gestione errori di validazione Laravel (422)
        if (err?.response?.status === 422 && err.response.data?.errors) {
          setFieldErrors(err.response.data.errors);
        }
        const message =
          err?.response?.data?.message ||
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
