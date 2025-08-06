import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { handleApiError } from '../services/api';

interface UseApiCallOptions {
  successMessage?: string;
  errorMessage?: string;
  showErrorAlert?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseApiCallReturn<T> {
  execute: (...args: any[]) => Promise<T | undefined>;
  loading: boolean;
  error: string | null;
  data: T | null;
  reset: () => void;
}

export function useApiCall<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions = {}
): UseApiCallReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    successMessage,
    errorMessage,
    showErrorAlert = true,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        setData(result);

        if (successMessage) {
          enqueueSnackbar(successMessage, { variant: 'success' });
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err: any) {
        const errorMsg = handleApiError(err);
        setError(errorMsg);

        if (showErrorAlert) {
          enqueueSnackbar(errorMessage || errorMsg, { variant: 'error' });
        }

        if (onError) {
          onError(err);
        }

        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, successMessage, errorMessage, showErrorAlert, onSuccess, onError, enqueueSnackbar]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}